const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return FleetWallet.init(sequelize, DataTypes);
}

class FleetWallet extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('FleetWallet', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    fleet_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'fleets',
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
    tableName: 'fleet_wallet',
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
        name: "FK_FLEETS_1_idx",
        using: "BTREE",
        fields: [
          { name: "fleet_id" },
        ]
      },
      {
        name: "FK_ITM_TRANSACTIONS_2_idx",
        using: "BTREE",
        fields: [
          { name: "transaction_id" },
        ]
      },
    ]
  });
  }
}
