"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoJS = require("crypto-js");
const ecdsa = require("elliptic"); //타원곡선
const _ = require("lodash");
const ec = new ecdsa.ec("secp256k1");
const COINBASE_AMOUNT = 50;

class UnspentTxOut {
  constructor(txOutId, txOutIndex, address, amount) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.address = address;
    this.amount = amount;
  }
}
exports.UnspentTxOut = UnspentTxOut;
class TxIn {}
exports.TxIn = TxIn;
class TxOut {
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }
}
exports.TxOut = TxOut;
class Transaction {}
exports.Transaction = Transaction;
const getTransactionId = (transaction) => {
  const txInContent = transaction.txIns
    .map((txIn) => txIn.txOutId + txIn.txOutIndex)
    .reduce((a, b) => a + b, "");
  const txOutContent = transaction.txOuts
    .map((txOut) => txOut.address + txOut.amount)
    .reduce((a, b) => a + b, "");
  return CryptoJS.SHA256(txInContent + txOutContent).toString();
};
exports.getTransactionId = getTransactionId;
const validateTransaction = (transaction, aUnspentTxOuts) => {
  if (!isValidTransactionStructure(transaction)) {
    return false;
  }
  if (getTransactionId(transaction) !== transaction.id) {
    console.log("잘못된 tx id: " + transaction.id);
    return false;
  }
  const hasValidTxIns = transaction.txIns
    .map((txIn) => validateTxIn(txIn, transaction, aUnspentTxOuts))
    .reduce((a, b) => a && b, true);
  if (!hasValidTxIns) {
    console.log("유효하지 않은 tx " + transaction.id);
    return false;
  }
  const totalTxInValues = transaction.txIns
    .map((txIn) => getTxInAmount(txIn, aUnspentTxOuts))
    .reduce((a, b) => a + b, 0);
  const totalTxOutValues = transaction.txOuts
    .map((txOut) => txOut.amount)
    .reduce((a, b) => a + b, 0);
  if (totalTxOutValues !== totalTxInValues) {
    console.log(
      "totalTxOutValues !== totalTxInValues in tx: " + transaction.id
    );
    return false;
  }
  return true;
};
exports.validateTransaction = validateTransaction;
const validateBlockTransactions = (
  aTransactions,
  aUnspentTxOuts,
  blockIndex
) => {
  const coinbaseTx = aTransactions[0];
  if (!validateCoinbaseTx(coinbaseTx, blockIndex)) {
    console.log("잘못된 코인베이스 거래 " + JSON.stringify(coinbaseTx));
    return false;
  }
  // 중복 txIn을 확인하는것,  각 txIn은 한 번만 포함됨
  const txIns = _(aTransactions)
    .map((tx) => tx.txIns)
    .flatten()
    .value();
  if (hasDuplicates(txIns)) {
    return false;
  }

  // 코인베이스를 제외한 모든 거래
  const normalTransactions = aTransactions.slice(1);
  return normalTransactions
    .map((tx) => validateTransaction(tx, aUnspentTxOuts))
    .reduce((a, b) => a && b, true);
};
const hasDuplicates = (txIns) => {
  const groups = _.countBy(txIns, (txIn) => txIn.txOutId + txIn.txOutIndex);
  return _(groups)
    .map((value, key) => {
      if (value > 1) {
        console.log("중복된 txIn: " + key);
        return true;
      } else {
        return false;
      }
    })
    .includes(true);
};
exports.hasDuplicates = hasDuplicates;

// 유효한 코인베이스 트렌젝션
const validateCoinbaseTx = (transaction, blockIndex) => {
  if (transaction == null) {
    console.log(" 블록의 첫 tx는 코인베이스 tx여야함");
    return false;
  }
  if (getTransactionId(transaction) !== transaction.id) {
    console.log("잘못된 코인베이스  tx id: " + transaction.id);
    return false;
  }
  if (transaction.txIns.length !== 1) {
    console.log("하나의 txIn은 코인페이스tx에 지정되어야함 ");
    return;
  }
  if (transaction.txIns[0].txOutIndex !== blockIndex) {
    console.log("코인베이스의 tx의 txIn 더 긴 블록이여야함");
    return false;
  }
  if (transaction.txOuts.length !== 1) {
    console.log("코인베이스의 tx 의 잘못된txout 수..");
    return false;
  }
  if (transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
    console.log("코인베이스 거래 잘못된 코인베이스 금액임...");
    return false;
  }
  return true;
};

// 유효한 트렌젝션인입
const validateTxIn = (txIn, transaction, aUnspentTxOuts) => {
  const referencedUTxOut = aUnspentTxOuts.find(
    (uTxO) =>
      uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex
  );
  if (referencedUTxOut == null) {
    console.log("referenced txOut not found: " + JSON.stringify(txIn));
    return false;
  }
  const address = referencedUTxOut.address;
  const key = ec.keyFromPublic(address, "hex");
  const validSignature = key.verify(transaction.id, txIn.signature);
  if (!validSignature) {
    console.log(
      "invalid txIn signature: %s txId: %s address: %s",
      txIn.signature,
      transaction.id,
      referencedUTxOut.address
    );
    return false;
  }
  return true;
};

const getTxInAmount = (txIn, aUnspentTxOuts) => {
  return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
};
const findUnspentTxOut = (transactionId, index, aUnspentTxOuts) => {
  return aUnspentTxOuts.find(
    (uTxO) => uTxO.txOutId === transactionId && uTxO.txOutIndex === index
  );
};

const getCoinbaseTransaction = (address, blockIndex) => {
  const t = new Transaction();
  const txIn = new TxIn();
  txIn.signature = "";
  txIn.txOutId = "";
  txIn.txOutIndex = blockIndex;
  t.txIns = [txIn];
  t.txOuts = [new TxOut(address, COINBASE_AMOUNT)];
  t.id = getTransactionId(t);
  return t;
};
exports.getCoinbaseTransaction = getCoinbaseTransaction;

//서명만들자아
const signTxIn = (transaction, txInIndex, privateKey, aUnspentTxOuts) => {
  const txIn = transaction.txIns[txInIndex];
  const dataToSign = transaction.id;
  const referencedUnspentTxOut = findUnspentTxOut(
    txIn.txOutId,
    txIn.txOutIndex,
    aUnspentTxOuts
  );
  if (referencedUnspentTxOut == null) {
    console.log("참조된txOut을 찾을수 없어 ㅠ");
    throw Error();
  }
  const referencedAddress = referencedUnspentTxOut.address;
  if (getPublicKey(privateKey) !== referencedAddress) {
    console.log(
      "프라이빗으로 입력 선언한다?" + "txin에서 비교한 주소랑 일치 안함"
    );
    throw Error();
  }
  const key = ec.keyFromPrivate(privateKey, "hex");
  const signature = toHexString(key.sign(dataToSign).toDER());
  return signature;
};
exports.signTxIn = signTxIn;

// UTXO 업데이트 하기
const updateUnspentTxOuts = (aTransactions, aUnspentTxOuts) => {
  //새 UTXO 만들기
  const newUnspentTxOuts = aTransactions
    .map((t) => {
      return t.txOuts.map(
        (txOut, index) =>
          new UnspentTxOut(t.id, index, txOut.address, txOut.amount)
      );
    })
    .reduce((a, b) => a.concat(b), []);

  // 사용된 tx out 만들기
  const consumedTxOuts = aTransactions
    .map((t) => t.txIns)
    .reduce((a, b) => a.concat(b), [])
    .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, "", 0));
  const resultingUnspentTxOuts = aUnspentTxOuts
    .filter(
      (uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)
    )
    .concat(newUnspentTxOuts);
  return resultingUnspentTxOuts;
};

//
const processTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
  if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
    console.log("invalid block transactions");
    return null;
  }
  return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
};
exports.processTransactions = processTransactions;
const toHexString = (byteArray) => {
  return Array.from(byteArray, (byte) => {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
};

// 공개키 만들기
const getPublicKey = (aPrivateKey) => {
  //프라이빗 키 가져와서 공개키 만들어
  return ec.keyFromPrivate(aPrivateKey, "hex").getPublic().encode("hex");
};
exports.getPublicKey = getPublicKey;

// 유효한 tx in 구조  확인하기
const isValidTxInStructure = (txIn) => {
  if (txIn == null) {
    console.log("txIn 이 null 값임 ");
    return false;
  } else if (typeof txIn.signature !== "string") {
    //타입을 비교함
    console.log("tx인풋의 서명 string 이 아님");
    return false;
  } else if (typeof txIn.txOutId !== "string") {
    console.log("tx인풋의 txoutid 가 string이 아님");
    return false;
  } else if (typeof txIn.txOutIndex !== "number") {
    console.log("tx인풋의 txoutindex가 number가 아님");
    return false;
  } else {
    return true;
  }
};

//유효한 tx output의 구조 검증
const isValidTxOutStructure = (txOut) => {
  if (txOut == null) {
    console.log("txOut 이 null값임");
    return false;
  } else if (typeof txOut.address !== "string") {
    console.log("유효하지 않은 txOut 주소. string 값이 아님");
    return false;
  } else if (!isValidAddress(txOut.address)) {
    console.log("TxOut 주소가 잘못 되었음");
    return false;
  } else if (typeof txOut.amount !== "number") {
    console.log("txOut 코인이 number가 아니다");
    return false;
  } else {
    return true;
  }
};

//유효한 tx 구조 검증
const isValidTransactionStructure = (transaction) => {
  if (typeof transaction.id !== "string") {
    console.log("txid 가 string 값이아님!");
    return false;
  }
  if (!(transaction.txIns instanceof Array)) {
    console.log("tx의 잘못된txIn유형임!");
    return false;
  }
  if (
    !transaction.txIns.map(isValidTxInStructure).reduce((a, b) => a && b, true)
  ) {
    return false;
  }
  if (!(transaction.txOuts instanceof Array)) {
    console.log("트랜잭션의 잘못된 txIn 유형임!");
    return false;
  }
  if (
    !transaction.txOuts
      .map(isValidTxOutStructure)
      .reduce((a, b) => a && b, true)
  ) {
    return false;
  }
  return true;
};
// valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
const isValidAddress = (address) => {
  //주소의 길이가 130자 가 아닐 경우 잘못된 공개키 길이다
  if (address.length !== 130) {
    console.log(address);
    console.log("잘못된 공개키 길이이다..");
    return false;
    //r
  } else if (address.match("^[a-fA-F0-9]+$") === null) {
    console.log("공개키는 16진수 문자만 포함해야함");
    return false;
  } else if (!address.startsWith("04")) {
    console.log("공개키는 04시작해야함");
    return false;
  }
  return true;
};
exports.isValidAddress = isValidAddress;
//# sourceMappingURL=transaction.js.map
