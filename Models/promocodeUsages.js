const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return PromocodeUsages.init(sequelize, DataTypes);
}

class PromocodeUsages extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('PromocodeUsages', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    promocode_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'promocodes',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('ADDED','USED','EXPIRED'),
      allowNull: false
    }
  }, {
    tableName: 'promocode_usages',
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
        name: "FK_USERS_9_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "FK_PROMOCODES_2_idx",
        using: "BTREE",
        fields: [
          { name: "promocode_id" },
        ]
      },
    ]
  });
  }
}
