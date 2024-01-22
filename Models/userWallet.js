const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return UserWallet.init(sequelize, DataTypes);
}

class UserWallet extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('UserWallet', {
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
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transaction_alias: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    transaction_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('C','D'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE(15,8),
      allowNull: false,
      defaultValue: 0.00000000
    },
    open_balance: {
      type: DataTypes.DOUBLE(15,8),
      allowNull: false,
      defaultValue: 0.00000000
    },
    close_balance: {
      type: DataTypes.DOUBLE(15,8),
      allowNull: false,
      defaultValue: 0.00000000
    }
  }, {
    tableName: 'user_wallet',
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
        name: "FK_USERS_15_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
