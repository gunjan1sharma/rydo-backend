const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return NightFares.init(sequelize, DataTypes);
}

class NightFares extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define('NightFares', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      from: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      to: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      extra_fee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    }, {
      tableName: 'night_fares',
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
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
