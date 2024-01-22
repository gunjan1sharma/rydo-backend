const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return ProviderCards.init(sequelize, DataTypes);
}

class ProviderCards extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('ProviderCards', {
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
    last_four: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    card_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_default: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'provider_cards',
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
        name: "FK_USERS_10_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
