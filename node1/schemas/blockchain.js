const Sequelize = require("sequelize");

module.exports = class Blockchain extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                version: {
                    type: Sequelize.DOUBLE,
                    allowNull: true,
                    unique: true,
                },
                index: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                previousHash: {
                    type: Sequelize.VIRTUAL,
                    allowNull: true,
                },
                timestamp: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    unique: true,
                },
                merkleRoot: {
                    type: Sequelize.VIRTUAL,
                    allowNull: true,
                    unique: true,
                },
                difficulty: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                },
                nonce: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    unique: true,
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: false,
                modelName: "Blockchain",
                tableName: "blockchains",
                paranoid: true,
                charset: "utf8",
                collate: "utf8_general_ci",
            }
        );
    }
    static associate(db) {}
};
