const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return PasswordResets.init(sequelize, DataTypes);
}

class PasswordResets extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('PasswordResets', {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'password_resets',
    timestamps: true,
    indexes: [
      {
        name: "password_resets_email_index",
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "password_resets_token_index",
        using: "BTREE",
        fields: [
          { name: "token" },
        ]
      },
    ]
  });
  }
}
