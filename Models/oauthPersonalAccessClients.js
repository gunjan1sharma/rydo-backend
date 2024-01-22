const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return OauthPersonalAccessClients.init(sequelize, DataTypes);
}

class OauthPersonalAccessClients extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('OauthPersonalAccessClients', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    client_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'oauth_clients',
        key: 'id'
      }
    }
  }, {
    tableName: 'oauth_personal_access_clients',
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
        name: "oauth_personal_access_clients_client_id_index",
        using: "BTREE",
        fields: [
          { name: "client_id" },
        ]
      },
    ]
  });
  }
}
