//도구적인 기능을 하는 함수를 포함
//getCurrentTimestamp() getVersion() hashMatchesDifficulty() findBlock()
//getDifficulty() getAdjustDifficulty()

//예상 채굴시간을 변수로 설정한다
const BLOCK_GENERATION_INTERVAL = 10; //second
//난이도 조절 단위수를 변수로 설정한다
const DIFFICULT_ADJUSTMENT_INTERVAL = 10; //in blocks

function getCurrentTimestamp() {
  const package = fs.readFileSync("package.json");
  console.log(JSON.parse(package).timestamp);
  return JSON.parse(package).timestamp;
}

//버전 계산하는 함수
function getVersion() {
  const package = fs.readFileSync("package.json");
  console.log(JSON.parse(package).version);
  return JSON.parse(package).version;
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
  }
}
module.exports = { getVersion, getCurrentTimestamp };
