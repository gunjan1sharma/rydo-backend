const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return NotificationMaster.init(sequelize, DataTypes);
}

class NotificationMaster extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define('NotificationMaster', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      notification_msg: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      notification_recipient: {
        type: DataTypes.ENUM('PASSENGER', 'PROVIDER'),
        allowNull: true
      },
      notification_reason: {
        type: DataTypes.STRING(45),
        allowNull: true
      }
    }, {
      tableName: 'notification_master',
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
      ]
    });
  }
}
