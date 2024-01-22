const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return WalletRequests.init(sequelize, DataTypes);
}

class WalletRequests extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('WalletRequests', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    alias_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    request_from: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "user,provider,fleet"
    },
    from_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    from_desc: {
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
    send_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "online,offline"
    },
    send_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "0-Pendig,1-Approved,2-cancel"
    }
  }, {
    tableName: 'wallet_requests',
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
    ]
  });
  }
}
