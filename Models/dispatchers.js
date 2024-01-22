const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Dispatchers.init(sequelize, DataTypes);
}

class Dispatchers extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Dispatchers', {
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
      unique: "dispatchers_email_unique"
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
    tableName: 'dispatchers',
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
        name: "dispatchers_email_unique",
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
