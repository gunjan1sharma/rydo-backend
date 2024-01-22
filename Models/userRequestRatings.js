const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return UserRequestRatings.init(sequelize, DataTypes);
}

class UserRequestRatings extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define(
    "UserRequestRatings",
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
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      provider_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "providers",
          key: "id",
        },
      },
      user_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      provider_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      user_comment: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      provider_comment: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "user_request_ratings",
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
          name: "FK_REQUESTS_5_idx",
          using: "BTREE",
          fields: [{ name: "request_id" }],
        },
        {
          name: "FK_USERS_13_idx",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "FK_PROVIDERS_10_idx",
          using: "BTREE",
          fields: [{ name: "provider_id" }],
        },
      ],
    }
  );
  }
}
