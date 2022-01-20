const db = require("../models");

//db띄우는함수
async function importBlockDB() {
  //   const { Block, BlockHeader, Blocks } = require("./r_blockchain");
  const Blockchain2 = require("../models/blockchain2");

  const test = await Blockchain2.findAll({ raw: true });
  console.log("->", test);
  return test;
}

module.exports = { importBlockDB };
