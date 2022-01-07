// 블록의 생성 검증  합의 알고리즘 포함 / (프로토콜을 변경하려면 여기서 수정?)
//createGenesisBlock() getBlocks() getLastBlock() createHash() calculateHash()
//nextBlock(bodyData)  addBlock(bodyData)

const fs = require("fs");
const merkle = require("merkle");
const cryptojs = require("crypto-js"); //암호화
const { getVersion, getCurrentTimestamp } = require("./r_utils");

//블록구조 헤더와 바디
class Block {
  constructor(header, body) {
    this.header = header;
    this.body = body;
  }
}
//헤더구조
class BlockHeader {
  constructor(version, previousHash, timestamp, merkleRoot, bit, nonce) {
    this.version = version;
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.merkleRoot = merkleRoot;
    this.bit = bit;
    this.nonce = nonce;
  }
}

// //버전 계산하는 함수
// function getVersion() {
//   const package = fs.readFileSync("package.json");
//   console.log(JSON.parse(package).version);
//   return JSON.parse(package).version;
// }

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
  const bit = 0;
  const nonce = 0;
  //난이도 추가
  const difficulty = 0;

  //헤더에 대입
  const header = new BlockHeader(
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot,
    bit,
    nonce,
    difficulty
  );
  return new Block(header, body);
}

//블록 여러개 저장할 수 있는 배열을 만들어줌
let Blocks = [createGenesisBlock()];

//현재 있는 함수들 다 가져오는 함수
function getBlocks() {
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
    bit,
    nonce,
    difficulty,
  } = data.header;
  const blockString =
    version +
    index +
    previousHash +
    timestamp +
    merkleRoot +
    bit +
    nonce +
    difficulty;
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
  bit,
  nonce,
  difficulty
) {
  //헤더의 값에 변경된 nonce값을 추가하고 모두 더한 string을 가지고 암호화해서 hash내보냄
  const blockString =
    version +
    index +
    previousHash +
    timestamp +
    merkleRoot +
    bit +
    nonce +
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
  const tree = merkle("sha256").sync(bodyDate);
  const merkleRoot = tree.root() || "0".repeat(64);
  //난이도 조절함수 추가 //utils에 getDifficulty 함수 있음요
  const difficulty = getDifficulty(getBlocks());

  const header = findBlock(
    version,
    index,
    previousHash,
    timestamp,
    merkleRoot,
    difficulty
  );

  return new Block(header, bodyData);
}

//블록 추가하는 함수
function addBlock(bodyData) {
  const newBlock = nextBlock(bodyData);
  Blocks.push(newBlock);
}
