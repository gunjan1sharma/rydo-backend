const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Fleets.init(sequelize, DataTypes);
}

class Fleets extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define(
    "Fleets",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "fleets_email_unique",
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      company: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      remember_token: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      commission: {
        type: DataTypes.DOUBLE(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      wallet_balance: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      stripe_cust_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      tableName: "fleets",
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
          name: "fleets_email_unique",
          unique: true,
          using: "BTREE",
          fields: [{ name: "email" }],
        },
      ],
    }
  );
  }
}
