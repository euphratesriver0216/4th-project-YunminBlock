"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const transaction_1 = require("./transaction");
let transactionPool = [];

//TX

//쉘카피 딥카피 공부 다시해...
const getTransactionPool = () => {
  return _.cloneDeep(transactionPool);
};

exports.getTransactionPool = getTransactionPool;
const addToTransactionPool = (tx, unspentTxOuts) => {
  if (!transaction_1.validateTransaction(tx, unspentTxOuts)) {
    throw Error("잘못된 tx을 pool에 넣으려고 합니다.");
  }
  if (!isValidTxForPool(tx, transactionPool)) {
    throw Error("잘못된 tx을 pool에 넣으려고 합니다.");
  }
  console.log("adding to txPool: %s", JSON.stringify(tx));
  transactionPool.push(tx);
};
exports.addToTransactionPool = addToTransactionPool;
const hasTxIn = (txIn, unspentTxOuts) => {
  const foundTxIn = unspentTxOuts.find((uTxO) => {
    return uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex;
  });
  return foundTxIn !== undefined;
};
const updateTransactionPool = (unspentTxOuts) => {
  const invalidTxs = [];
  for (const tx of transactionPool) {
    for (const txIn of tx.txIns) {
      if (!hasTxIn(txIn, unspentTxOuts)) {
        invalidTxs.push(tx);
        break;
      }
    }
  }
  if (invalidTxs.length > 0) {
    console.log(
      "txPool에서 다음 트랜잭션을 제거합니다.: %s",
      JSON.stringify(invalidTxs)
    );
    transactionPool = _.without(transactionPool, ...invalidTxs);
  }
};
exports.updateTransactionPool = updateTransactionPool;
const getTxPoolIns = (aTransactionPool) => {
  return _(aTransactionPool)
    .map((tx) => tx.txIns)
    .flatten()
    .value();
};

//유효한 tx를 pool에 입력합니다.
const isValidTxForPool = (tx, aTtransactionPool) => {
  const txPoolIns = getTxPoolIns(aTtransactionPool);
  const containsTxIn = (txIns, txIn) => {
    return _.find(txPoolIns, (txPoolIn) => {
      return (
        txIn.txOutIndex === txPoolIn.txOutIndex &&
        txIn.txOutId === txPoolIn.txOutId
      );
    });
  };
  for (const txIn of tx.txIns) {
    if (containsTxIn(txPoolIns, txIn)) {
      console.log("txIn가 이미 txPool에 있어요!");
      return false;
    }
  }
  return true;
};
//# sourceMappingURL=transactionPool.js.map
