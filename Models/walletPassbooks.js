const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return WalletPassbooks.init(sequelize, DataTypes);
}

class WalletPassbooks extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('WalletPassbooks', {
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
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('CREDITED','DEBITED'),
      allowNull: false
    },
    via: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'wallet_passbooks',
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
        name: "FK_USERS_16_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
