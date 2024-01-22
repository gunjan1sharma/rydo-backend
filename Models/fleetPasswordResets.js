const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return FleetPasswordResets.init(sequelize, DataTypes);
}

class FleetPasswordResets extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('FleetPasswordResets', {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'fleet_password_resets',
    timestamps: true,
    indexes: [
      {
        name: "fleet_password_resets_email_index",
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "fleet_password_resets_token_index",
        using: "BTREE",
        fields: [
          { name: "token" },
        ]
      },
    ]
  });
  }
}
