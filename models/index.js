const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

//기존
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

//시도
// const sequelize = new Sequelize(
//   config.database,
//   config.username,
//   config.password,
//   config
// );

db.sequelize = sequelize;

module.exports = db;
