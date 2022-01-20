const Sequelize = require("sequelize");
const Blockchain = require("./blockchain");
const Blockchain2 = require("./blockchain2");
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

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Blockchain = Blockchain;
db.Blockchain2 = Blockchain2;

Blockchain.init(sequelize);
Blockchain2.init(sequelize);

Blockchain.associate(db);
Blockchain2.associate(db);
module.exports = db;
