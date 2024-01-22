const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Cards.init(sequelize, DataTypes);
}

class Cards extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Cards', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
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
    last_four: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    card_id: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    tableName: 'cards',
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
        name: "FK_USERS_1_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "FK_CARD_IDX",
        using: "BTREE",
        fields: [
          { name: "card_id" },
        ]
      },
    ]
  });
  }
}
