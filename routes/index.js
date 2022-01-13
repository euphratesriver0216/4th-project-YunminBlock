// const express = require("express");
// const blockchain = require("../models/blockchain");
// const { getBlocks } = require("../node1/r_blockchain");

// const router = express.Router();
// router.get("/", async (req, res, next) => {
//   try {
//     const blocks = await blockchain.findAll();
//     res.render(getBlocks(blocks));
//   } catch (err) {
//     console.err(err);
//     next(err);
//   }
// });
