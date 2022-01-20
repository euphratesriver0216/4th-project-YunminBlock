const Sequelize = require("sequelize");

module.exports = class Blockchain extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        Blockchain: {
          type: Sequelize.JSON,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Newblockchains2",
        tableName: "Newblockchains2",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {}
};
