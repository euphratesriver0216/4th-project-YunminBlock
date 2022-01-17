const Sequelize = require("sequelize");

module.exports = class Blockchain extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        BlockchainNode1: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        BlockchainNode2: {
          type: Sequelize.JSON,
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Blockchain",
        tableName: "Newblockchains",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {}
};
