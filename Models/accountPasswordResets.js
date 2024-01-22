const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return AccountPasswordResets.init(sequelize, DataTypes);
}

class AccountPasswordResets extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('AccountPasswordResets', {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'account_password_resets',
    timestamps: true,
    indexes: [
      {
        name: "account_password_resets_email_index",
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "account_password_resets_token_index",
        using: "BTREE",
        fields: [
          { name: "token" },
        ]
      },
    ]
  });
  }
}
