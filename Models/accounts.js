const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Accounts.init(sequelize, DataTypes);
}

class Accounts extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Accounts', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "accounts_email_unique"
    },
    mobile: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    remember_token: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'accounts',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "accounts_email_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}
