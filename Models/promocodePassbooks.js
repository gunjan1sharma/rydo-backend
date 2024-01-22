const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return PromocodePassbooks.init(sequelize, DataTypes);
}

class PromocodePassbooks extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('PromocodePassbooks', {
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
    tableName: 'promocode_passbooks',
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
        name: "FK_USERS_8_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "FK_PROMOCODES_1_idx",
        using: "BTREE",
        fields: [
          { name: "promocode_id" },
        ]
      },
    ]
  });
  }
}
