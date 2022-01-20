// HTTP Server 초기화, p2p Sever 초기화 , 지갑초기화
// 사용자와 노드간의 통신

//포트설정
const p2p_port = process.env.P2P_PORT || 6002;
const WebSocket = require("ws");
const {
  createHash,
  addBlock,
  getLastBlock,
  getBlocks,
  replaceChain,
} = require("./r_blockchain");

//p2p서버 초기화하는 함수
function initP2PServer(test_port) {
  const server = new WebSocket.Server({ port: test_port });
  server.on("connection", (ws) => {
    initConnection(ws);
  });
  console.log("Listening webSocket port : " + test_port);
}

initP2PServer(6002);

let sockets = [];

function initConnection(ws) {
  sockets.push(ws);
  initMessageHandler(ws);
  initErrorHandler(ws);
  write(ws, queryLastestMsg());
}

function getSockets() {
  return sockets;
}

//메세지를 제이슨 형태로 전달: 내가 가지고 있는 블록체인이 올바르지 않으면 다른거랑 비교해서 틀리면 교체한다
function write(ws, message) {
  ws.send(JSON.stringify(message));
}

//위에랑 같은 기능인데 각각 소켓 , 메세지에 넣어주는 듯
function broadcast(message) {
  sockets.forEach((socket) => {
    write(socket, message);
  });
}
//

function connectToPeers(newPeers) {
  newPeers.forEach((peer) => {
    const ws = new WebSocket(peer);
    ws.on("open", () => {
      console.log("open");
      initConnection(ws);
    });
    ws.on("error", (errorType) => {
      console.log("connection Failed") + errorType;
    });
  });
}

//메세지 핸들러 message handler
const MessageType = {
  //내가 가지고 있는 가장 최신 블록을 담아서 보내줌
  QUERY_LATEST: 0,
  //내가 가지고 있는 데이터필드 전체에 블록 담아서 보낼때
  QUERY_ALL: 1,
  //데이터필드에 하나 이상의 블록이 있을 때 회신할 때는 이타입으로 한다
  RESPONSE_BLOCKCHAIN: 2,
};

function initMessageHandler(ws) {
  ws.on("message", (data) => {
    const message = JSON.parse(data);
    switch (message.type) {
      case MessageType.QUERY_LATEST:
        //마지막블록 보내줌
        write(ws, responseLatestMsg());
        break;
      case MessageType.QUERY_ALL:
        //전체다
        write(ws, responseAllChainMsg());
        break;
      case MessageType.RESPONSE_BLOCKCHAIN:
        //메세지보내줌
        handleBlockChainResponse(message);
        break;
    }
  });
}

//마지막 최신 블록 담아서 보내줌
function responseLatestMsg() {
  const { getLastBlock } = require("./r_blockchain");

  return {
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([getLastBlock()]),
  };
}
//블록들 다 가져와 보내줌
function responseAllChainMsg() {
  const { getBlocks } = require("./r_blockchain");

  return {
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify(getBlocks()),
  };
}
function handleBlockChainResponse(message) {
  const { getLastBlock } = require("./r_blockchain");

  const receiveBlocks = JSON.parse(message.data);
  //받은 것중에 마지막꺼
  const latestReceiveBlock = receiveBlocks[receiveBlocks.length - 1];
  const latesMyBlock = getLastBlock();
  //만약 받은 마지막블럭 인덱스 > 내가 가진 마지막 블럭의 인덱스
  if (latestReceiveBlock.header.index > latesMyBlock.header.index) {
    //만약 내가 가진 마지막 블럭 === 받은 마지막 블럭 해더의 이전해시
    if (createHash(latesMyBlock) === latestReceiveBlock.header.previousHash) {
      //받은 마지막 블럭을 내꺼에 추가
      if (addBlock(latestReceiveBlock)) {
        //요청
        broadcast(responseLatestMsg());
      } else {
        console.log("Invalid Block");
      }
    } //받은 블럭의 전체 길이가 1일때
    else if (receiveBlocks.length === 1) {
      //요청 블록 전체 다시 달라
      broadcast(queryAllMsg());
    } // 아닐 때는 내 전체 블록이 다른 블록보다 동기화가 안된상황,
    else {
      //지금받은 걸로 통채를 갈아끼워야함
      console.log("여기 들어오지않니");
      replaceChain(receiveBlocks);
    }
  } else {
    console.log("Do nothing");
  }
}

function queryAllMsg() {
  return {
    type: MessageType.QUERY_ALL,
    data: null,
  };
}

function queryLastestMsg() {
  return {
    type: MessageType.QUERY_LATEST,
    data: null,
  };
}
//테스트하려면 서버 2개 열어서 요청하고 받은 걸 타입들이 오는지 확인
function initErrorHandler(ws) {
  ws.on("close", () => {
    closeConnection(ws);
  });
  ws.on("error", () => {
    closeConnection(ws);
  });
}

function closeConnection(ws) {
  console.log(`Connection close ${ws.url}`);
  //splice는 소켓을 복사해더 뒤에 넣음 초기화한다고 생각
  sockets.splice(sockets.indexOf(ws), 1);
}

module.exports = { connectToPeers, getSockets, broadcast, responseLatestMsg };
