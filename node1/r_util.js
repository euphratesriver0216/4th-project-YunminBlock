//db저장하는 함수
const blockchain = require("../models/blockchain");
function addDB(newBlock) {
  console.log("바디데이터", newBlock);
  const {
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot,
    difficulty,
    nonce,
  } = newBlock.header;
  console.log("바디데이터의 헤더", newBlock.header);
  blockchain
    .create({
      version: version,
      index: index,
      previousHash: previousHash,
      timestamp: timestamp,
      merkleRoot: merkleRoot,
      difficulty: difficulty,
      nonce: nonce,
    })
    .then(() => {
      console.log("블록db저장 성공");
    })
    .catch((err) => {
      console.log("블록 db 저장실패", err);
    });
}

module.exports = { addDB };
