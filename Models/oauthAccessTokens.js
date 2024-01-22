const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return OauthAccessTokens.init(sequelize, DataTypes);
}

class OauthAccessTokens extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('OauthAccessTokens', {
    id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'oauth_access_tokens',
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
        name: "oauth_access_tokens_user_id_index",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "oauth_access_tokens_client_id_index",
        using: "BTREE",
        fields: [
          { name: "client_id" },
        ]
      },
    ]
  });
  }
}
