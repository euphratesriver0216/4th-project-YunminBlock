// HTTP Server 초기화, p2p Sever 초기화 , 지갑초기화
// 사용자와 노드간의 통신
const express = require("express");
const bodyParser = require("body-parser");
const {
  getBlocks,
  nextBlock,
  getVersion,
  addBlock,
} = require("./r_blockchain");
const { connectToPeers, getSockets } = require("./r_P2PServer");
const { getPublicKeyFromWallet, initWallet } = require("./r_encryption");
const { broadcast, responseLatestMsg } = require("./r_P2PServer");
// const { message } = require("statuses");
const http_port = process.env.HTTP_PORT || 3002;
const cors = require("cors");

function initHttpServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  //추가
  app.post("/addPeers", (req, res) => {
    const data = req.body.data || [];
    console.log(data);
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
    broadcast(responseLatestMsg());
    res.send(getBlocks());
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
      console.log("나는 지갑");
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
