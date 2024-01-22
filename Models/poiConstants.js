const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return PoiConstants.init(sequelize, DataTypes);
}

class PoiConstants extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define('PoiConstants', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      latitude: {
        type: DataTypes.DOUBLE(15, 8),
        allowNull: false
      },
      longitude: {
        type: DataTypes.DOUBLE(15, 8),
        allowNull: false
      },
      zone: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      tableName: 'poi_constants',
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
