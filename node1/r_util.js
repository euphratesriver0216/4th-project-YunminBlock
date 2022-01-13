// //db저장하는 함수
// const blockchain = require("../models/blockchain");

// function addDB(newBlock) {
//   const { Blocks, getBlocks } = require("./r_blockchain");
//   console.log("-----", getBlocks());
//   console.log("----------------------------", Blocks);
//   console.log("바디데이터", newBlock);
//   console.log(typeof newBlock.header.index);
//   console.log(newBlock.header.index);
//   const {
//     version,
//     index,
//     previousHash,
//     timestamp,
//     merkleRoot,
//     difficulty,
//     nonce,
//   } = newBlock.header;
//   console.log("바디데이터의 헤더", newBlock);
//   blockchain
//     .create({
//       version: version,
//       index: index,
//       previousHash: previousHash,
//       timestamp: timestamp,
//       merkleRoot: merkleRoot,
//       difficulty: difficulty,
//       nonce: nonce,
//     })
//     .then(() => {
//       console.log("블록db저장 성공");
//     })
//     .catch((err) => {
//       console.log("블록 db 저장실패", err);
//     });
// }

// module.exports = { addDB };
