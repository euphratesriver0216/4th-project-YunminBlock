"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const _ = require("lodash");
const blockchain_1 = require("./blockchain");
const p2p_1 = require("./p2p");
const transactionPool_1 = require("./transactionPool");
const wallet_1 = require("./wallet");
const cors = require("cors");
const httpPort = parseInt(process.env.HTTP_PORT) || 3002;
const p2pPort = parseInt(process.env.P2P_PORT) || 6002;
const initHttpServer = (myHttpPort) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  app.use((err, req, res, next) => {
    if (err) {
      res.status(400).send(err.message);
    }
  });
  app.get("/blocks", (req, res) => {
    res.send(blockchain_1.getBlockchain());
  });

  app.get("/block/:hash", (req, res) => {
    const block = _.find(blockchain_1.getBlockchain(), {
      hash: req.params.hash,
    });
    res.send(block);
  });
  app.get("/transaction/:id", (req, res) => {
    const tx = _(blockchain_1.getBlockchain())
      .map((blocks) => blocks.data)
      .flatten()
      .find({ id: req.params.id });
    res.send(tx);
  });

  app.get("/address/:address", (req, res) => {
    const unspentTxOuts = _.filter(
      blockchain_1.getUnspentTxOuts(),
      (uTxO) => uTxO.address === req.params.address
    );
    res.send({ unspentTxOuts: unspentTxOuts });
  });

  //장부 불러오는 아이..
  app.get("/unspentTransactionOutputs", (req, res) => {
    res.send(blockchain_1.getUnspentTxOuts());
  });

  //
  app.get("/myUnspentTransactionOutputs", (req, res) => {
    res.send(blockchain_1.getMyUnspentTransactionOutputs());
  });
  app.post("/mineRawBlock", (req, res) => {
    if (req.body.data == null) {
      res.send("data parameter is missing");
      return;
    }
    const newBlock = blockchain_1.generateRawNextBlock(req.body.data);
    if (newBlock === null) {
      res.status(400).send("could not generate block");
    } else {
      res.send(newBlock);
    }
  });
  app.post("/mineBlock", (req, res) => {
    const newBlock = blockchain_1.generateNextBlock();
    if (newBlock === null) {
      res.status(400).send("could not generate block");
    } else {
      res.send(newBlock);
    }
  });

  //잔고조회 :버튼화
  app.get("/balance", (req, res) => {
    const balance = blockchain_1.getAccountBalance();
    res.send({ balance: balance });
  });

  //내주소
  app.get("/address", (req, res) => {
    const address = wallet_1.getPublicFromWallet();
    res.send({ address: address });
  });

  //별쓸모 없는 아이 ..
  app.post("/mineTransaction", (req, res) => {
    const address = req.body.address;
    const amount = req.body.amount;
    try {
      const resp = blockchain_1.generatenextBlockWithTransaction(
        address,
        amount
      );
      res.send(resp);
    } catch (e) {
      console.log(e.message);
      res.status(400).send(e.message);
    }
  });

  // 받는사람 지갑주소 송금 금액... 송금버튼
  app.post("/sendTransaction", (req, res) => {
    try {
      const address = req.body.address;
      const amount = parseInt(req.body.amount);
      if (address === undefined || amount === undefined) {
        throw Error("invalid address or amount");
      }
      const resp = blockchain_1.sendTransaction(address, amount);
      res.send(resp);
    } catch (e) {
      console.log(e.message);
      res.status(400).send(e.message);
    }
  });

  app.get("/transactionPool", (req, res) => {
    res.send(transactionPool_1.getTransactionPool());
  });
  app.get("/peers", (req, res) => {
    res.send(
      p2p_1
        .getSockets()
        .map((s) => s._socket.remoteAddress + ":" + s._socket.remotePort)
    );
  });
  app.post("/addPeer", (req, res) => {
    p2p_1.connectToPeers("ws://localhost:6001");
    res.send();
  });
  app.post("/stop", (req, res) => {
    res.send({ msg: "stopping server" });
    process.exit();
  });
  app.listen(myHttpPort, () => {
    console.log("Listening http on port: " + myHttpPort);
  });
};
initHttpServer(httpPort);
p2p_1.initP2PServer(p2pPort);
wallet_1.initWallet();
//# sourceMappingURL=main.js.map
