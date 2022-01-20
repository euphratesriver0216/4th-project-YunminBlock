const Sequelize = require("sequelize");

module.exports = class Blockchain extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        ID: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        Blockchain: {
          type: Sequelize.JSON,
          allowNull: null,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Newblockchains",
        tableName: "Newblockchains",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {}
};
