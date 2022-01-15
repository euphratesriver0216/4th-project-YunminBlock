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
                modelName: "Blockchain",
                tableName: "Newblockchains",
                paranoid: true,
                charset: "utf8",
                collate: "utf8_general_ci",
            }
        );
    }
    static associate(db) { }
};
