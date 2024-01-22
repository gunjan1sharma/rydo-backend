const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Chats.init(sequelize, DataTypes);
}

class Chats extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Chats', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    request_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'user_requests',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    provider_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'providers',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('up','pu'),
      allowNull: false
    },
    delivered: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'chats',
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
        name: "FK_USER_REQUEST_1_idx",
        using: "BTREE",
        fields: [
          { name: "request_id" },
        ]
      },
      {
        name: "FK_PROVIDERS_1_idx",
        using: "BTREE",
        fields: [
          { name: "provider_id" },
        ]
      },
      {
        name: "FK_USERS_2_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
