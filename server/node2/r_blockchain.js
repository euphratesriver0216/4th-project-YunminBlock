// 블록의 생성 검증  합의 알고리즘 포함 / (프로토콜을 변경하려면 여기서 수정?)
//createGenesisBlock() getBlocks() getLastBlock() createHash() calculateHash()
//nextBlock(bodyData)  addBlock(bodyData)

const fs = require("fs");
const merkle = require("merkle");
const cryptojs = require("crypto-js"); //암호화
const { isValidChain } = require("./r_checkValidBlock");
const { importBlockDB } = require("./r_util");
const { Blockchain2 } = require("../models");

//예상 채굴시간을 변수로 설정한다
const BLOCK_GENERATION_INTERVAL = 10; //second
//난이도 조절 단위수를 변수로 설정한다
const DIFFICULT_ADJUSTMENT_INTERVAL = 10; //in blocks

//블록구조 헤더와 바디
class Block {
  constructor(header, body) {
    this.header = header;
    this.body = body;
  }
}
//헤더구조
class BlockHeader {
  constructor(
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot,
    // bit,
    difficulty,
    nonce
  ) {
    this.version = version;
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.merkleRoot = merkleRoot;
    // this.bit = bit;
    this.difficulty = difficulty; //채굴난이도. 아직안씀
    this.nonce = nonce;
  }
}

//버전 계산하는 함수
function getVersion() {
  const package = fs.readFileSync("package.json");
  console.log(JSON.parse(package).version);
  return JSON.parse(package).version;
}

//제네시스 블록
function createGenesisBlock() {
  const version = getVersion();
  //맨처음 인덱스
  const index = 0;
  const previousHash = "0".repeat(64);
  // const timestamp = parseInt(Date.now() / 1000);
  //최초 비트코인최초탄생일
  const timestamp = 1231006505;
  const body = ["윤민팀 제네시스바디"];
  const tree = merkle("sha256").sync(body);
  const merkleRoot = tree.root() || "0".repeat(64);
  // const bit = 0;

  //난이도 추가
  const difficulty = 2;

  const nonce = 10;

  //헤더에 대입
  const header = new BlockHeader(
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot,
    // bit,
    difficulty,
    nonce
  );
  return new Block(header, body);
}

//블록 여러개 저장할 수 있는 배열을 만들어줌
let Blocks = [];
// console.log(Blocks);

//현재 있는 함수들 다 가져오는 함수
function getBlocks() {
  //db를 띄우게 해보자고 넣어본 함수인데
  //콘솔로 정보들어오는것만확인함
  // const GET_BLOCK = importBlockDB();
  // console.log("겟", GET_BLOCK);
  return Blocks;
}

//제일 마지막에 만든 블록가져오는 함수
function getLastBlock() {
  return Blocks[Blocks.length - 1];
}

//data에는 블록이 들어오는 거고 이 블록을 가지고
//해시값만드는 함수
function createHash(data) {
  //인자로 받은 것중에 헤더를 뽑아내서
  const {
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot,
    // bit,
    difficulty,
    nonce,
  } = data.header;
  const blockString =
    version +
    index +
    previousHash +
    timestamp +
    merkleRoot +
    // bit +
    difficulty +
    nonce;
  //다합쳐서 해시로 만들고 리턴
  const hash = cryptojs.SHA256(blockString).toString();
  return hash;
}

//해시 계산 함수(nonce추가해서 hash만듦)
function calculateHash(
  version,
  index,
  previousHash,
  timestamp,
  merkleRoot,
  // bit,
  difficulty,
  nonce
) {
  //헤더의 값에 변경된 nonce값을 추가하고 모두 더한 string을 가지고 암호화해서 hash내보냄
  const blockString =
    version +
    index +
    previousHash +
    timestamp +
    merkleRoot +
    // bit +
    difficulty +
    nonce;

  const hash = cryptojs.SHA256(blockString).toString();
  return hash;
}

//다음블록 만들었을 때 기존 블록 정보 가져와
function nextBlock(bodyData) {
  //마지막 블록
  const prevBlock = getLastBlock();
  const version = getVersion();
  //넥스트블록의 인덱스는 이전블록 헤더인덱스+1
  const index = prevBlock.header.index + 1;
  //이전 블록의 해시값
  const previousHash = createHash(prevBlock);
  const timestamp = parseInt(Date.now() / 1000);
  const tree = merkle("sha256").sync(bodyData);
  const merkleRoot = tree.root() || "0".repeat(64);
  //난이도 조절함수 추가 //utils에 getDifficulty 함수 있음요
  const difficulty = getDifficulty(getBlocks());

  // console.log("나니도", difficulty);
  const header = findBlock(
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot,
    difficulty
  );
  // console.log("넥스트", header);
  return new Block(header, bodyData);
}

//블록 추가하는 함수
//넣는 인자 bodyData에서 newBlock으로 바꿈요
function addBlock(newBlock) {
  const Blockchain = require("../models/blockchain");
  // const newBlock = nextBlock(bodyData);
  // console.log("블록스찍히나", Blocks);
  Blocks.push(newBlock);
  Blockchain.create({ Blockchain: newBlock });
}

function replaceChain(newBlocks) {
  if (isValidChain(newBlocks)) {
    if (
      newBlocks.length > Blocks.length ||
      (newBlocks.length === Blocks.length && random.boolean())
    ) {
      Blocks = newBlocks;
      broadcast(responseLatestMsg());
    }
  } else {
    // console.log("받은 원장에 문제가 있음");
  }
}

function hexToBinary(s) {
  //헤더부분을 sha256 암호화한 결과
  //16진수 64자리를 2진수로 변환하기
  const lookupTable = {
    0: "0000",
    1: "0001",
    2: "0010",
    3: "0011",
    4: "0100",
    5: "0101",
    6: "0110",
    7: "0111",
    8: "1000",
    9: "1001",
    A: "1010",
    B: "1011",
    C: "1100",
    D: "1101",
    E: "1110",
    F: "1111",
  };

  let ret = "";
  for (let i = 0; i < s.length; i++) {
    if (lookupTable[s[i]]) {
      ret += lookupTable[s[i]];
    } else {
      return null;
    }
  }
  return ret;
}

function hashMatchesDifficulty(hash, difficulty) {
  //difficulty 난이도가 높아짐에 따라 0개수가 늘어남
  const requirePrefix = "0".repeat(difficulty);
  //높으면 높을수록 조건을 맞츠기가 까다로워짐
  return hash.startsWith(requirePrefix);
}

function findBlock(
  currentVersion,
  nextIndex,
  previousHash,
  nextTimestamp,
  merkleRoot,
  difficulty
) {
  //
  let nonce = 0;
  while (true) {
    var hash = calculateHash(
      currentVersion,
      nextIndex,
      previousHash,
      nextTimestamp,
      merkleRoot,
      difficulty,
      nonce
    );
    // console.log(hash);
    if (hashMatchesDifficulty(hash, difficulty)) {
      return new BlockHeader(
        currentVersion,
        nextIndex,
        previousHash,
        nextTimestamp,
        merkleRoot,
        difficulty,
        nonce
      );
    }

    nonce++;
  }
}

function getDifficulty(blocks) {
  //마지막 블럭
  const lastBlock = blocks[blocks.length - 1];
  //마지막 블럭헤더인덱스가 0이 아니고 난이도조절수만큼 나눈 나머지가 0이면
  if (
    lastBlock.header.index !== 0 &&
    lastBlock.header.index % DIFFICULT_ADJUSTMENT_INTERVAL === 0
  ) {
    //난이도 조절함수 실행
    return getAdjustDifficulty(lastBlock, blocks);
  }
  //난이도 리턴
  return lastBlock.header.difficulty;
}

//난이도 조절함수
function getAdjustDifficulty(lastBlock, blocks) {
  //이전조절블록 = [블록길이-10]의 블록
  const preAdjustmentBlock =
    blocks[blocks.length - DIFFICULT_ADJUSTMENT_INTERVAL];
  //경과시간(생성되는데 걸린 시간) = 마지막블록의 헤더가 생성된 시간 - [블록길이-10]의 블록의 생성시간
  const elapsedTime =
    lastBlock.header.timestamp - preAdjustmentBlock.header.timestamp;
  //예상시간 = 예상채굴시간(10초) * 난이도조절단위수(블록 10.. 인덱스라고 걍 이해함.)
  const expectedTime =
    BLOCK_GENERATION_INTERVAL * DIFFICULT_ADJUSTMENT_INTERVAL;

  //생성시간 /2는 우리가 임의로 넣어두는 알고리즘임
  if (elapsedTime / 2 > expectedTime) {
    return preAdjustmentBlock.header.difficulty - 1;
  } else if (elapsedTime * 2 < expectedTime) {
    return preAdjustmentBlock.header.difficulty + 1;
  } else {
    return preAdjustmentBlock.header.difficulty;
  }
}

//현재 타임스템프 찍어주는 함수
function getCurrentTimestamp() {
  //Math.round 반올림함수
  return Math.round(new Date().getTime() / 1000);
}

//유효한 타임스탬프인지 보는 함수
function isValidTimestamp(newBlock, prevBlock) {
  // console.log("뺀거:", newBlock.header.timestamp - prevBlock.header.timestamp);
  // console.log(getCurrentTimestamp());
  //5초이내에 생성되는 걸 막음
  if (newBlock.header.timestamp - prevBlock.header.timestamp < 5) {
    return false;
  }
  //검증자의 시간과 새로운 블록의 시간과 비교! 검증자가 검증하는데
  //검증하는 시간이랑 만들어진 블록의 시간이 너무 차이가 나면 버림
  if (getCurrentTimestamp() - newBlock.header.timestamp > 60) {
    return false;
  }
  return true;
}

function blockchainInit(YM) {
  YM.forEach((blocks) => {
    // DB에 있는 제이슨 형식의 블록들을 객체형식으로 가져와서 bc배열에 푸시푸시
    Blocks.push(blocks.Blockchain);
  });

  if (Blocks.length === 0) {
    //0이면 제네시스없는거니깐 넣어주셈
    console.log(1414234);
    Blockchain2.create({ Blockchain: createGenesisBlock() });
    Blocks.push(createGenesisBlock());
  }
}

//다음블록생성 출력하기
// const block1 = nextBlock(["Test"]);
// console.log(object);

// addBlock(block1);
// console.log("다음블록", block1);
// console.log(add);

module.exports = {
  hashMatchesDifficulty,
  isValidTimestamp,
  getBlocks,
  createHash,
  Blocks,
  getLastBlock,
  nextBlock,
  addBlock,
  getVersion,
  createGenesisBlock,
  replaceChain,
  BlockHeader,
  Block,
  blockchainInit,
}; //내보내주는거
