const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return DispatcherPasswordResets.init(sequelize, DataTypes);
}

class DispatcherPasswordResets extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('DispatcherPasswordResets', {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'dispatcher_password_resets',
    timestamps: true,
    indexes: [
      {
        name: "dispatcher_password_resets_email_index",
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "dispatcher_password_resets_token_index",
        using: "BTREE",
        fields: [
          { name: "token" },
        ]
      },
    ]
  });
  }
}
