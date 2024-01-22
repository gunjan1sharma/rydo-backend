const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return CustomPushes.init(sequelize, DataTypes);
}

class CustomPushes extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('CustomPushes', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    send_to: {
      type: DataTypes.ENUM('ALL','USERS','PROVIDERS'),
      allowNull: false
    },
    condition: {
      type: DataTypes.ENUM('ACTIVE','LOCATION','RIDES','AMOUNT'),
      allowNull: false
    },
    condition_data: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sent_to: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    schedule_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'custom_pushes',
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
    ]
  });
  }
}
