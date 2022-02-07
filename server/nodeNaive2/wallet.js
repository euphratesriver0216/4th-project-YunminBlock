"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elliptic_1 = require("elliptic");
const fs_1 = require("fs");
const _ = require("lodash");
const transaction_1 = require("./transaction");
const EC = new elliptic_1.ec("secp256k1");
const privateKeyLocation = process.env.PRIVATE_KEY || "nodeNaive2/wallet";
const privateKeyFile = privateKeyLocation + "/private_key";
const getPrivateFromWallet = () => {
  const buffer = fs_1.readFileSync(privateKeyFile, "utf8");
  return buffer.toString();
};
exports.getPrivateFromWallet = getPrivateFromWallet;
const getPublicFromWallet = () => {
  const privateKey = getPrivateFromWallet();
  const key = EC.keyFromPrivate(privateKey, "hex");
  return key.getPublic().encode("hex");
};

exports.getPublicFromWallet = getPublicFromWallet;
const generatePrivateKey = () => {
  const keyPair = EC.genKeyPair();
  const privateKey = keyPair.getPrivate();
  return privateKey.toString(16);
};
exports.generatePrivateKey = generatePrivateKey;
const initWallet = () => {
  // let's not override existing private keys
  if (fs_1.existsSync(privateKeyFile)) {
    return;
  }

  const newPrivateKey = generatePrivateKey();
  if (fs_1.existsSync(privateKeyFile)) {
    console.log("기존지갑 private key 경로 :" + privateKeyFile);
    return;
  }
  if (!fs_1.existsSync("nodeNaive2/wallet/")) {
    fs_1.mkdirSync("nodeNaive2/wallet/");
  }
  fs_1.writeFileSync(privateKeyFile, newPrivateKey);
  console.log(
    "new wallet with private key created to : %s",
    privateKeyLocation
  );
};
exports.initWallet = initWallet;
const deleteWallet = () => {
  if (fs_1.existsSync(privateKeyFile)) {
    fs_1.unlinkSync(privateKeyFile);
  }
};

exports.deleteWallet = deleteWallet;
const getBalance = (address, unspentTxOuts) => {
  return _(findUnspentTxOuts(address, unspentTxOuts))
    .map((uTxO) => uTxO.amount)
    .sum();
};
exports.getBalance = getBalance;
const findUnspentTxOuts = (ownerAddress, unspentTxOuts) => {
  return _.filter(unspentTxOuts, (uTxO) => uTxO.address === ownerAddress);
};
exports.findUnspentTxOuts = findUnspentTxOuts;
const findTxOutsForAmount = (amount, myUnspentTxOuts) => {
  let currentAmount = 0;
  const includedUnspentTxOuts = [];
  for (const myUnspentTxOut of myUnspentTxOuts) {
    includedUnspentTxOuts.push(myUnspentTxOut);
    currentAmount = currentAmount + myUnspentTxOut.amount;
    if (currentAmount >= amount) {
      const leftOverAmount = currentAmount - amount;
      return { includedUnspentTxOuts, leftOverAmount };
    }
  }
  const eMsg =
    "사용가능한 UTXO가 없어요" +
    " 충분한 잔고가 없어요" +
    amount +
    ". 니가 가지고 있는 UTXO는" +
    JSON.stringify(myUnspentTxOuts) +
    "이다";
  throw Error(eMsg);
};
const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
  const txOut1 = new transaction_1.TxOut(receiverAddress, amount);
  if (leftOverAmount === 0) {
    return [txOut1];
  } else {
    const leftOverTx = new transaction_1.TxOut(myAddress, leftOverAmount);
    return [txOut1, leftOverTx];
  }
};

const filterTxPoolTxs = (unspentTxOuts, transactionPool) => {
  const txIns = _(transactionPool)
    .map((tx) => tx.txIns)
    .flatten()
    .value();
  const removable = [];
  for (const unspentTxOut of unspentTxOuts) {
    const txIn = _.find(txIns, (aTxIn) => {
      return (
        aTxIn.txOutIndex === unspentTxOut.txOutIndex &&
        aTxIn.txOutId === unspentTxOut.txOutId
      );
    });
    if (txIn === undefined) {
    } else {
      removable.push(unspentTxOut);
    }
  }
  return _.without(unspentTxOuts, ...removable);
};
const createTransaction = (
  receiverAddress, // 받는 사람 주소
  amount, // 받을 금액
  privateKey, // 보내는사람의 키
  unspentTxOuts, // 장부
  txPool
) => {
  console.log("txPool: %s", JSON.stringify(txPool));
  const myAddress = transaction_1.getPublicKey(privateKey);
  const myUnspentTxOutsA = unspentTxOuts.filter(
    //utxo에 부합하는내용을 filter로 가지고 옴
    (uTxO) => uTxO.address === myAddress //잔고 확인절차
  );

  //utxo의 갯수/잔액을 확인해서 거래를 제한한다.
  const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);
  // filter from unspentOutputs such inputs that are referenced in pool
  const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(
    amount,
    myUnspentTxOuts
  );
  const toUnsignedTxIn = (unspentTxOut) => {
    const txIn = new transaction_1.TxIn();
    txIn.txOutId = unspentTxOut.txOutId;
    txIn.txOutIndex = unspentTxOut.txOutIndex;
    return txIn;
  };
  const unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);
  const tx = new transaction_1.Transaction();
  tx.txIns = unsignedTxIns;
  tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
  tx.id = transaction_1.getTransactionId(tx);
  tx.txIns = tx.txIns.map((txIn, index) => {
    txIn.signature = transaction_1.signTxIn(
      tx,
      index,
      privateKey,
      unspentTxOuts
    );
    return txIn;
  });
  return tx;
};
exports.createTransaction = createTransaction;
//# sourceMappingURL=wallet.js.map
