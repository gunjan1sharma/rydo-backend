const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return ProviderWallet.init(sequelize, DataTypes);
}

class ProviderWallet extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('ProviderWallet', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    provider_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'providers',
        key: 'id'
      }
    },
    transaction_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'ltm_translations',
        key: 'id'
      }
    },
    transaction_alias: {
      type: DataTypes.STRING(255),
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
    tableName: 'provider_wallet',
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
        name: "FK_PROVIDERS_6_idx",
        using: "BTREE",
        fields: [
          { name: "provider_id" },
        ]
      },
      {
        name: "FK_ITM_TRANSACTIONS_3_idx",
        using: "BTREE",
        fields: [
          { name: "transaction_id" },
        ]
      },
    ]
  });
  }
}
