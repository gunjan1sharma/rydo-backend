const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return ProviderDevices.init(sequelize, DataTypes);
};

class ProviderDevices extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define(
      "ProviderDevices",
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        provider_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "providers",
            key: "id",
          },
        },
        udid: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        token: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        sns_arn: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        type: {
          type: DataTypes.ENUM("android", "ios"),
          allowNull: false,
        },
      },
      {
        tableName: "provider_devices",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "FK_PROVIDERS_2_idx",
            using: "BTREE",
            fields: [{ name: "provider_id" }],
          },
        ],
      }
    );
  }
}
