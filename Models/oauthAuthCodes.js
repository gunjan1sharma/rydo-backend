const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return OauthAuthCodes.init(sequelize, DataTypes);
}

class OauthAuthCodes extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('OauthAuthCodes', {
    id: {
      type: DataTypes.STRING(100),
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
    client_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'oauth_clients',
        key: 'id'
      }
    },
    scopes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'oauth_auth_codes',
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
        name: "FK_USERS_6_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "FK_OAUTH_CLIENTS_2_idx",
        using: "BTREE",
        fields: [
          { name: "client_id" },
        ]
      },
    ]
  });
  }
}
