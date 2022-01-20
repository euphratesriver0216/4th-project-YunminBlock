// HTTP Server 초기화, p2p Sever 초기화 , 지갑초기화
// 사용자와 노드간의 통신

//포트설정
const p2p_port = process.env.P2P_PORT || 6002;
const WebSocket = require("ws");

//p2p서버 초기화하는 함수
function initP2PServer(p2p_port) {
  const server = new WebSocket.Server({ port: p2p_port });
  // 해당 서버가 연결되면
  server.on("connection", (ws) => {
    // 연결 초기화 함수 실행
    initConnection(ws);
  });
  console.log("Listening webSocket port : " + p2p_port);
}
// 내 소켓서버는 6002번 포트!
initP2PServer(6002);

// 내가 연결할 사람들 주소록
let sockets = [];

// 연결 초기화 함수
function initConnection(ws) {
  // 내 주소록에 메시지 주고받을 연락처 추가
  sockets.push(ws);
  // 메시지 수신했을 때 메뉴얼
  initMessageHandler(ws);
  // 에러 처리용
  initErrorHandler(ws);
  // 마지막 블록 달라고 제이슨 형식으로 변환해서 달라고 하기
  write(ws, queryLatestMsg());
}

// 연락처목록(소켓목록) 받아오는 함수
function getSockets() {
  return sockets;
}

//메세지를 제이슨 형태로 전달: 내가 가지고 있는 블록체인이 올바르지 않으면 다른거랑 비교해서 틀리면 교체한다
function write(ws, message) {
  ws.send(JSON.stringify(message));
}

//위에랑 같은 기능인데 각각 소켓 , 메세지에 넣어주는 듯
// write를 연결된 소켓들에게 전부 보내는 것
function broadcast(message) {
  // 메시지를 내 주소록에 있는 모두에게 전송하기
  // sockets를 forEach로 돌려서
  sockets.forEach((socket) => {
    // 메시지 전송
    write(socket, message);
  });
}

// 연결
function connectToPeers(peer) {
  const ws = new WebSocket(peer);
  // 해당 웹 소켓이 열려있으면 초기화 해주기(소통가능!)
  ws.on("open", () => {
    console.log(peer + "이 열려있어요!");
    initConnection(ws);
  });
  ws.on("error", () => {
    console.log(peer + "는 열려있지 않은가봐요");
  });
}

//메세지 핸들러 message handler
const MessageType = {
  // 상대의 마지막 블록을 달라고 하고 싶으면
  QUERY_LATEST: 0,
  // 상대의 모든 블록을 달라고 하고 싶으면
  QUERY_ALL: 1,
  // 내 블록을 상대에게 보내려면
  RESPONSE_BLOCKCHAIN: 2,
};

// 메시지 핸들러 (받은 메시지에 맞게 답장 보내주기)
function initMessageHandler(ws) {
  // 메시지 받는게 있으면 들어옴
  ws.on("message", (data) => {
    // 받은 메시지는 <buffer 7b 22 74 79 70 65...>
    // 이걸 제이슨 형식으로 바꿔서 저장
    const message = JSON.parse(data);

    // 메시지 타입 따라 분기
    switch (message.type) {
      // 0: 상대가 마지막 블록 내놓으라 그러면
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

// 상대가 보내준 마지막 블록 or 블록체인 전체를 내 블록체인과 비교하여 답장하기
function handleBlockChainResponse(message) {
  const { getLastBlock } = require("./r_blockchain");
  const { createHash } = require("./r_blockchain");
  const { addBlock } = require("./r_checkValidBlock");
  const { replaceChain } = require("./r_blockchain");

  // 메시지로 받은 객체 {타입, 블록} 에서 블록을 receiveBlocks에 담기
  // 받은 메시지를 제이슨 형식으로 변환하여 receiveBlocks에 담기
  const receiveBlocks = JSON.parse(message.data);

  // 메시지로 받은 블록체인 or 블록이 없으면 메시지 출력하고 아무것도 안하기
  if (receiveBlocks.length === 0) {
    console.log("메시지로 받은 블록체인이나 블록이 한개도 없어");
    return;
  }
  // 메시지로 받은 블록체인에서 마지막 블록을 변수에 담음
  const latestReceiveBlock = receiveBlocks[receiveBlocks.length - 1];
  const { isValidBlockStructure } = require("./r_checkValidBlock");
  if (!isValidBlockStructure(latestReceiveBlock)) {
    console.log("block structuture not valid");
    return;
  }
  // 내 블록의 마지막 블록을 변수에 담음
  const latesMyBlock = getLastBlock();

  // 메시지로 받은 마지막 블록의 인덱스가 내 마지막 블록 인덱스보다 크면
  // (내 블록체인보다 1개 이상 길면)
  if (latestReceiveBlock.header.index > latesMyBlock.header.index) {
    console.log(
      "내 블록체인의 인덱스보다 저놈이 준 블록체인의 인덱스가 더 크네!"
    );
    // 내 마지막 블록의 해시와 상대의 마지막 바로 이전 블록의 해시가 같으면
    // (즉 내 블록보다 한 개 더 많은 경우)
    if (createHash(latesMyBlock) === latestReceiveBlock.header.previousHash) {
      //받은 마지막 블럭을 내꺼에 추가
      if (addBlock(latestReceiveBlock)) {
        console.log("내거보다 한개 더 길구나 저 블록 내거에 연결하면 되겟다!");
        console.log("동네사람들! 저 블록 한개 새로 연결했음!");
        // 내꺼에 추가한 블록 소켓으로 전달
        broadcast(responseLatestMsg());
      }
    } //받은 블럭의 전체 길이가 1일때
    else if (receiveBlocks.length === 1) {
      //요청 블록 전체 다시 달라
      console.log("동네사람들! 여러분이 가진 블록체인 좀 줘봐요");
      broadcast(queryAllMsg());
    } // 아닐 때는 내 전체 블록이 다른 블록보다 동기화가 안된상황,
    else {
      //지금받은 걸로 통채를 갈아끼워야함
      console.log("내가 가진 블록체인보다 쟤가 준 블록체인이 더 길어서");
      console.log("내거 버리고 새걸로 교체해야겟담");
      replaceChain(receiveBlocks);
    }
    // 메시지로 받은 블록체인이 내 블록체인보다 같거나 짧으면 아무것도 안하기
  } else {
    console.log(
      "전달 받은 블록체인이 내가 가진 블록체인보다 길지 않으니까 암것도 안할거야"
    );
  }
}

// 상대에게 블록체인 전부 달라고 하는 전갈
function queryAllMsg() {
  return {
    type: MessageType.QUERY_ALL, // 블록체인 줘
    data: null, // 달라고 하는것이므로 내가 보낼 블록 없음
  };
}

// 상대에게 마지막 블록 내놔보라고 하는 전갈
function queryLatestMsg() {
  return {
    type: MessageType.QUERY_LATEST, // 마지막 블록줘
    data: null, // 달라고 하는것이므로 내가 보낼 블록 없음
  };
}
//테스트하려면 서버 2개 열어서 요청하고 받은 걸 타입들이 오는지 확인
// 연결 초기화 오류 핸들러
function initErrorHandler(ws) {
  // 해당 소켓이 닫혀있으면 연결목록에서 제거
  ws.on("close", () => {
    closeConnection(ws);
    console.log("연결 닫힘");
  });
  // 해당 소켓이 오류면 연결목록에서 제거
  ws.on("error", () => {
    closeConnection(ws);
    console.log("연결 초기화 오류");
  });
}

// 연결 목록에서 제거하는 함수
function closeConnection(ws) {
  console.log(`${ws.url} 가 연결이 끊어졌어요`);
  // 연결이 끊어진 사람은 연락처에서 빼기
  sockets.splice(sockets.indexOf(ws), 1);
}

module.exports = {
  initP2PServer,
  initConnection,
  connectToPeers,
  getSockets,
  broadcast,
  responseLatestMsg,
  responseAllChainMsg,
};
