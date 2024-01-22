const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return RequestFilters.init(sequelize, DataTypes);
}

class RequestFilters extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define(
    "RequestFilters",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      request_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user_requests",
          key: "id",
        },
      },
      provider_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        references: {
          model: "providers",
          key: "id",
        },
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "request_filters",
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
          name: "FK_USER_REQUESTS_2_idx",
          using: "BTREE",
          fields: [{ name: "request_id" }],
        },
        {
          name: "FK_PROVIDERS_7_idx",
          using: "BTREE",
          fields: [{ name: "provider_id" }],
        },
      ],
    }
  );
  }
}
