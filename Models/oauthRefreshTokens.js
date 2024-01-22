const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return OauthRefreshTokens.init(sequelize, DataTypes);
}

class OauthRefreshTokens extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('OauthRefreshTokens', {
    id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    access_token_id: {
      type: DataTypes.STRING(100),
      allowNull: false
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
    tableName: 'oauth_refresh_tokens',
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
        name: "oauth_refresh_tokens_access_token_id_index",
        using: "BTREE",
        fields: [
          { name: "access_token_id" },
        ]
      },
    ]
  });
  }
}
