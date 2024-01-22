const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return AdminWallet.init(sequelize, DataTypes);
}

class AdminWallet extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('AdminWallet', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
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
    transaction_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1-commission,2-userrecharge,3-tripdebit,4-providerrecharge,5-providersettle,6-fleetrecharge,7-fleetcommission,8-fleetsettle,9-taxcredit,10-discountdebit,11-discountrecharge"
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
    tableName: 'admin_wallet',
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
        name: "FK_ITEM_TRANSACTION_1_idx",
        using: "BTREE",
        fields: [
          { name: "transaction_id" },
        ]
      },
    ]
  });
  }
}
