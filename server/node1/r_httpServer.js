// HTTP Server 초기화, p2p Sever 초기화 , 지갑초기화
// 사용자와 노드간의 통신
const express = require("express");
const bodyParser = require("body-parser");
// const Blockchain = require("../models/blockchain");
const {
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
const sequelize = require("sequelize");
const Blockchain = require("../models/blockchain");

const http_port = process.env.HTTP_PORT || 3001;

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

  app.get("/api/blocks", (req, res) => {
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
