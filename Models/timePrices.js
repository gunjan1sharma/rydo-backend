const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return TimePrices.init(sequelize, DataTypes);
}

class TimePrices extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('TimePrices', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    time_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'times',
        key: 'id'
      }
    },
    service_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'service_types',
        key: 'id'
      }
    },
    peak_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    tableName: 'time_prices',
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
        name: "FK_TIMES_1_idx",
        using: "BTREE",
        fields: [
          { name: "time_id" },
        ]
      },
      {
        name: "FK_SERVICE_TYPES_2_idx",
        using: "BTREE",
        fields: [
          { name: "service_id" },
        ]
      },
    ]
  });
  }
}
