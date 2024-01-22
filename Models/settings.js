const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Settings.init(sequelize, DataTypes);
}

class Settings extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define('Settings', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      tableName: 'settings',
      timestamps: false,
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
          name: "settings_key_index",
          using: "BTREE",
          fields: [
            { name: "key" },
          ]
        },
      ]
    });
  }
}
