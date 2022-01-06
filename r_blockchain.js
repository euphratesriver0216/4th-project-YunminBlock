// 블록의 생성 검증  합의 알고리즘 포함 / 프로토콜을 변경하려면 여기서 수정

const cryptojs = require("crypto-js"); //암호화

class BlockHeader {}

class Block {
  constructor(header, body) {
    this.header = header;
    this.body = body;
  }
}

const blockchain = []; //blocks이다.

// 기존 chainedBlock.js 의 내용들로 구성
