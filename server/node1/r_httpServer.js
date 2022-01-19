// HTTP Server 초기화, p2p Sever 초기화 , 지갑초기화
// 사용자와 노드간의 통신
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize } = require("../models");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());
// const Blockchain = require("../models/blockchain");
const {
  createGenesisBlock,
  getBlocks,
  nextBlock,
  getVersion,
  addBlock,
} = require("./r_blockchain");
const {
  connectToPeers,
  getSockets,
  broadcast,
  responseLatestMsg,
} = require("./r_P2PServer");
const { getPublicKeyFromWallet, initWallet } = require("./r_encryption");
const { importBlockDB } = require("./r_util");
const Blockchain = require("../models/blockchain");

const http_port = process.env.HTTP_PORT || 3001;
//--------------------------추가 부분 --------------------
sequelize
  .sync({ force: false })
  //이미 db가 있으면 force 가 true면 table을 새로 만들고 false 일 경우 기존 table 사용
  .then(() => {
    console.log("db에 연결 해줄껭");
    Blockchain.findAll().then((YM) => {
      let ym = [];
      YM.forEach((blocks) => {
        console.log(1111111);
        // DB에 있는 제이슨 형식의 블록들을 객체형식으로 가져와서 bc배열에 푸시푸시
        ym.push(blocks.Blockchain);
        console.log(22222222);
        console.log(ym[0].header.nonce);
      });

      if (ym.length === 0) {
        //0이면 제네시스없는거니깐 넣어주셈
        Blockchain.create({ Blockchain: createGenesisBlock() });
        ym.push(createGenesisBlock());
      }
    });
  }); //  dbBlockCheck -> db에 있는 bc를 검증하는 함수

function initHttpServer() {
  const app = express();
  app.use(bodyParser.json());
  //추가
  app.post("/addPeers", (req, res) => {
    const data = req.body.data || [];
    // console.log(data);
    connectToPeers(data);
    res.send(data);
  });

  app.get("/peers", (req, res) => {
    let sockInfo = [];
    getSockets().forEach((s) => {
      sockInfo.push(s._socket.remoteAddress + ":" + s._socket.remotePort);
    });
    res.send(sockInfo);
  });

  // const corsOptions = {
  //   origin: "http://localhost:3000",
  //   credentials: true,
  // };

  app.use(cors());
  app.get("/blocks", (req, res) => {
    res.send(getBlocks());
  });

  app.get("/version", (req, res) => {
    res.send(getVersion());
  });

  app.post("/mineBlock", (req, res) => {
    const data = req.body.data || [];
    console.log(data);
    const block = nextBlock(data);
    addBlock(block);
    // broadcast(block)
    broadcast(responseLatestMsg());
    res.send(getBlocks());
    //디비저장하는 함수 만들어보자
    // addDB(getBlocks());
  });
  //////////////////추가////////////
  app.post("/data", (req, res) => {
    connection.query(
      "SELECT * FROM NewBlockchains",
      function (err, rows, fields) {
        if (err) {
          console.log("데이터 가져오기 실패");
        } else {
          console.log(rows[0]);
          res.send(rows[0]);
        }
      }
    );
  });

  app.post("/stop", (req, res) => {
    res.send({ msg: "Stop Server!" });
    process.exit();
  });

  app.get("/address", (req, res) => {
    initWallet();
    const address = getPublicKeyFromWallet().toString();
    console.log(getPublicKeyFromWallet());
    if (address != "") {
      res.send({ address: address });
    } else {
      res.send("empty address");
    }
  });
  app.listen(http_port, () => {
    console.log("Listening http Port: " + http_port);
  });
}

initHttpServer();
initWallet();

//db띄우는함수
// importBlockDB();
