const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return OauthClients.init(sequelize, DataTypes);
}

class OauthClients extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('OauthClients', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    secret: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    redirect: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    personal_access_client: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    password_client: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'oauth_clients',
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
        name: "oauth_clients_user_id_index",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
