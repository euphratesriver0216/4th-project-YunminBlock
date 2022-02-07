"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoJS = require("crypto-js");
const _ = require("lodash");
const p2p_1 = require("./p2p");
const transaction_1 = require("./transaction");
const transactionPool_1 = require("./transactionPool");
const util_1 = require("./util");
const wallet_1 = require("./wallet");

// 블록에서 어떤 모양을 가지고 있는지 정의 해봅시다.
class Block {
  constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}
exports.Block = Block;

//최초의 트렌젝션
const genesisTransaction = {
  txIns: [{ signature: "", txOutId: "", txOutIndex: 0 }],
  txOuts: [
    {
      address:
        "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a",
      amount: 50, //트렌젝션이 발생했을 때 보상으로 주는 가격
    },
  ],
  id: "e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3",
};

//최초의 블럭
const genesisBlock = new Block(
  0,
  "91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627",
  "",
  1465154705,
  [genesisTransaction],
  0,
  0
);

//
let blockchain = [genesisBlock];
//최초 블럭에서 사용되지 않은 txout은  UTXO로 변환된다
let unspentTxOuts = transaction_1.processTransactions(
  blockchain[0].data, //제네시스 블럭의 안의 tx들
  [], //첫장부는 비어있고
  0 // 블록 인덱스
);

// 기존 블록체인 가져오기
const getBlockchain = () => blockchain;
//이건어디로? 보내는거니
exports.getBlockchain = getBlockchain;
const getUnspentTxOuts = () => _.cloneDeep(unspentTxOuts);
exports.getUnspentTxOuts = getUnspentTxOuts;
// and txPool should be only updated at the same time
const setUnspentTxOuts = (newUnspentTxOut) => {
  console.log("replacing unspentTxouts with: %s", newUnspentTxOut);
  unspentTxOuts = newUnspentTxOut;
};

//마지막 블록 가져와..
const getLatestBlock = () => blockchain[blockchain.length - 1];
exports.getLatestBlock = getLatestBlock;
// 블록 생성 10초
const BLOCK_GENERATION_INTERVAL = 10;
// 난이도 조절은  블록 생성 10개마다
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

//난이도 가져오기
const getDifficulty = (aBlockchain) => {
  //마지막 블록 가져오기
  const latestBlock = aBlockchain[blockchain.length - 1];
  if (
    latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
    latestBlock.index !== 0
  ) {
    return getAdjustedDifficulty(latestBlock, aBlockchain);
  } else {
    return latestBlock.difficulty;
  }
};

//난이도 조절
const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
  const prevAdjustmentBlock =
    aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];

  // 예상 시간
  const timeExpected =
    BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  //아오 영어 해석시간이네..
  // 블록이 생성되는 간격 X 난이도가 조절되는 간격

  //시간이 얼마나 소요되냐
  const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
  //마지막 블럭의의 시간 - 이전 블록의 난이도 조절 시간??
  if (timeTaken < timeExpected / 2) {
    return prevAdjustmentBlock.difficulty + 1;
  } else if (timeTaken > timeExpected * 2) {
    return prevAdjustmentBlock.difficulty - 1;
  } else {
    return prevAdjustmentBlock.difficulty;
  }
};

// 현재시간을 타임스탬프로 가져오기
const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);

//새로운 블럭을 생성하자
const generateRawNextBlock = (blockData) => {
  //이전 블록의 마지막블록
  const previousBlock = getLatestBlock();

  const difficulty = getDifficulty(getBlockchain());
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = getCurrentTimestamp();
  const newBlock = findBlock(
    nextIndex,
    previousBlock.hash,
    nextTimestamp,
    blockData,
    difficulty
  );

  if (addBlockToChain(newBlock)) {
    p2p_1.broadcastLatest();
    return newBlock;
  } else {
    return null;
  }
};
exports.generateRawNextBlock = generateRawNextBlock;
// gets the unspent transaction outputs owned by the wallet
const getMyUnspentTransactionOutputs = () => {
  return wallet_1.findUnspentTxOuts(
    wallet_1.getPublicFromWallet(),
    getUnspentTxOuts()
  );
};
exports.getMyUnspentTransactionOutputs = getMyUnspentTransactionOutputs;
const generateNextBlock = () => {
  const coinbaseTx = transaction_1.getCoinbaseTransaction(
    wallet_1.getPublicFromWallet(),
    getLatestBlock().index + 1
  );
  const blockData = [coinbaseTx].concat(transactionPool_1.getTransactionPool());
  return generateRawNextBlock(blockData);
};
exports.generateNextBlock = generateNextBlock;
const generatenextBlockWithTransaction = (receiverAddress, amount) => {
  if (!transaction_1.isValidAddress(receiverAddress)) {
    throw Error("invalid address");
  }
  if (typeof amount !== "number") {
    throw Error("invalid amount");
  }
  const coinbaseTx = transaction_1.getCoinbaseTransaction(
    wallet_1.getPublicFromWallet(),
    getLatestBlock().index + 1
  );
  const tx = wallet_1.createTransaction(
    receiverAddress,
    amount,
    wallet_1.getPrivateFromWallet(),
    getUnspentTxOuts(),
    transactionPool_1.getTransactionPool()
  );
  const blockData = [coinbaseTx, tx];
  return generateRawNextBlock(blockData);
};
exports.generatenextBlockWithTransaction = generatenextBlockWithTransaction;
const findBlock = (index, previousHash, timestamp, data, difficulty) => {
  let nonce = 0;
  while (true) {
    const hash = calculateHash(
      index,
      previousHash,
      timestamp,
      data,
      difficulty,
      nonce
    );
    if (hashMatchesDifficulty(hash, difficulty)) {
      return new Block(
        index,
        hash,
        previousHash,
        timestamp,
        data,
        difficulty,
        nonce
      );
    }
    nonce++;
  }
};
const getAccountBalance = () => {
  return wallet_1.getBalance(
    wallet_1.getPublicFromWallet(),
    getUnspentTxOuts()
  );
};
exports.getAccountBalance = getAccountBalance;
const sendTransaction = (address, amount) => {
  const tx = wallet_1.createTransaction(
    address,
    amount,
    wallet_1.getPrivateFromWallet(), //누구의 지갑에서 돈을 꺼낼 것이냐 ..
    getUnspentTxOuts(), //장부 가져와
    transactionPool_1.getTransactionPool()
  );
  transactionPool_1.addToTransactionPool(tx, getUnspentTxOuts());
  p2p_1.broadCastTransactionPool();
  return tx;
};
exports.sendTransaction = sendTransaction;
const calculateHashForBlock = (block) =>
  calculateHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.data,
    block.difficulty,
    block.nonce
  );
const calculateHash = (
  index,
  previousHash,
  timestamp,
  data,
  difficulty,
  nonce
) =>
  CryptoJS.SHA256(
    index + previousHash + timestamp + data + difficulty + nonce
  ).toString();
const isValidBlockStructure = (block) => {
  return (
    typeof block.index === "number" &&
    typeof block.hash === "string" &&
    typeof block.previousHash === "string" &&
    typeof block.timestamp === "number" &&
    typeof block.data === "object"
  );
};
exports.isValidBlockStructure = isValidBlockStructure;
const isValidNewBlock = (newBlock, previousBlock) => {
  if (!isValidBlockStructure(newBlock)) {
    console.log("invalid block structure: %s", JSON.stringify(newBlock));
    return false;
  }
  if (previousBlock.index + 1 !== newBlock.index) {
    console.log("invalid index");
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    console.log("invalid previoushash");
    return false;
  } else if (!isValidTimestamp(newBlock, previousBlock)) {
    console.log("invalid timestamp");
    return false;
  } else if (!hasValidHash(newBlock)) {
    return false;
  }
  return true;
};
const getAccumulatedDifficulty = (aBlockchain) => {
  return aBlockchain
    .map((block) => block.difficulty)
    .map((difficulty) => Math.pow(2, difficulty))
    .reduce((a, b) => a + b);
};
const isValidTimestamp = (newBlock, previousBlock) => {
  return (
    previousBlock.timestamp - 60 < newBlock.timestamp &&
    newBlock.timestamp - 60 < getCurrentTimestamp()
  );
};
const hasValidHash = (block) => {
  if (!hashMatchesBlockContent(block)) {
    console.log("invalid hash, got:" + block.hash);
    return false;
  }
  if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
    console.log(
      "block difficulty not satisfied. Expected: " +
        block.difficulty +
        "got: " +
        block.hash
    );
  }
  return true;
};
const hashMatchesBlockContent = (block) => {
  const blockHash = calculateHashForBlock(block);
  return blockHash === block.hash;
};
const hashMatchesDifficulty = (hash, difficulty) => {
  const hashInBinary = util_1.hexToBinary(hash);
  const requiredPrefix = "0".repeat(difficulty);
  return hashInBinary.startsWith(requiredPrefix);
};
/*
    Checks if the given blockchain is valid. Return the unspent txOuts if the chain is valid
 */
const isValidChain = (blockchainToValidate) => {
  console.log("isValidChain:");
  console.log(JSON.stringify(blockchainToValidate));
  const isValidGenesis = (block) => {
    return JSON.stringify(block) === JSON.stringify(genesisBlock);
  };
  if (!isValidGenesis(blockchainToValidate[0])) {
    return null;
  }
  /*
    Validate each block in the chain. The block is valid if the block structure is valid
      and the transaction are valid
     */
  let aUnspentTxOuts = [];
  for (let i = 0; i < blockchainToValidate.length; i++) {
    const currentBlock = blockchainToValidate[i];
    if (
      i !== 0 &&
      !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])
    ) {
      return null;
    }
    aUnspentTxOuts = transaction_1.processTransactions(
      currentBlock.data,
      aUnspentTxOuts,
      currentBlock.index
    );
    if (aUnspentTxOuts === null) {
      console.log("invalid transactions in blockchain");
      return null;
    }
  }
  return aUnspentTxOuts;
};
const addBlockToChain = (newBlock) => {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    const retVal = transaction_1.processTransactions(
      newBlock.data,
      getUnspentTxOuts(),
      newBlock.index
    );

    if (retVal === null) {
      console.log("block is not valid in terms of transactions");
      return false;
    } else {
      blockchain.push(newBlock);
      setUnspentTxOuts(retVal);
      transactionPool_1.updateTransactionPool(unspentTxOuts);
      return true;
    }
  }
  return false;
};
exports.addBlockToChain = addBlockToChain;
const replaceChain = (newBlocks) => {
  const aUnspentTxOuts = isValidChain(newBlocks);
  const validChain = aUnspentTxOuts !== null;
  if (
    validChain &&
    getAccumulatedDifficulty(newBlocks) >
      getAccumulatedDifficulty(getBlockchain())
  ) {
    console.log(
      "Received blockchain is valid. Replacing current blockchain with received blockchain"
    );
    blockchain = newBlocks;
    setUnspentTxOuts(aUnspentTxOuts);
    transactionPool_1.updateTransactionPool(unspentTxOuts);
    p2p_1.broadcastLatest();
  } else {
    console.log("Received blockchain invalid");
  }
};
exports.replaceChain = replaceChain;
const handleReceivedTransaction = (transaction) => {
  transactionPool_1.addToTransactionPool(transaction, getUnspentTxOuts());
};
exports.handleReceivedTransaction = handleReceivedTransaction;
//# sourceMappingURL=blockchain.js.map
