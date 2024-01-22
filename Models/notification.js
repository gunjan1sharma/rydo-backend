const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Notification.init(sequelize, DataTypes);
}

class Notification extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define(
      "Notification",
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        notification_type_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: "notification_master",
            key: "id",
          },
        },
        user_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
        },
        provider_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: "providers",
            key: "id",
          },
        },
        notification_status: {
          type: DataTypes.ENUM("SENT", "NOT_SENT"),
          allowNull: true,
        },
        notification_response: {
          type: DataTypes.STRING(256),
          allowNull: true,
        },
        user_request_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: "user_requests",
            key: "id",
          },
        },
        ride_accept_status: {
          type: DataTypes.ENUM("PENDING", "ACCEPTED", "REJECTED", "NOT_USED"),
          allowNull: true,
        },
      },
      {
        tableName: "notification",
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
            name: "FK_USER_21_idx",
            using: "BTREE",
            fields: [{ name: "user_id" }],
          },
          {
            name: "FK_PROVIDER_21_idx",
            using: "BTREE",
            fields: [{ name: "provider_id" }],
          },
          {
            name: "FK_NOTIFICATION_1_idx",
            using: "BTREE",
            fields: [{ name: "notification_type_id" }],
          },
          {
            name: "FK_USER_REQUEST_21_idx",
            using: "BTREE",
            fields: [{ name: "user_request_id" }],
          },
        ],
      }
    );
  }
}
