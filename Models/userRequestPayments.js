const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return UserRequestPayments.init(sequelize, DataTypes);
}

class UserRequestPayments extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define(
    "UserRequestPayments",
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
      fleet_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "fleets",
          key: "id",
        },
      },
      promocode_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "promocodes",
          key: "id",
        },
      },
      payment_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      payment_mode: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fixed: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      distance: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      minute: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      hour: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      commision: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      commision_per: {
        type: DataTypes.DOUBLE(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      fleet: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      fleet_per: {
        type: DataTypes.DOUBLE(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      discount: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      discount_per: {
        type: DataTypes.DOUBLE(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax_per: {
        type: DataTypes.DOUBLE(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      wallet: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      outstation_days: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "0",
      },
      is_partial: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0-No,1-Yes",
      },
      cash: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      card: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      online: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      surge: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tips: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      payable: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      provider_commission: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      provider_pay: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      tableName: "user_request_payments",
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
          name: "FK_USER_REQUESTS_4_idx",
          using: "BTREE",
          fields: [{ name: "request_id" }],
        },
        {
          name: "FK_USERS_12_idx",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "FK_PROVIDERS_9_idx",
          using: "BTREE",
          fields: [{ name: "provider_id" }],
        },
        {
          name: "FK_FLEETS_2_idx",
          using: "BTREE",
          fields: [{ name: "fleet_id" }],
        },
        {
          name: "FK_PROMOCODES_4_idx",
          using: "BTREE",
          fields: [{ name: "promocode_id" }],
        },
      ],
    }
  );
  }
}
