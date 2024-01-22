const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Admins.init(sequelize, DataTypes);
}

class Admins extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Admins', {
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
      unique: "admins_email_unique"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    picture: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    remember_token: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'admins',
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
        name: "admins_email_unique",
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
