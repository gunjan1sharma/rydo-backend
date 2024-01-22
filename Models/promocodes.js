const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Promocodes.init(sequelize, DataTypes);
}

class Promocodes extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Promocodes', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    promo_code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    percentage: {
      type: DataTypes.DOUBLE(5,2),
      allowNull: false,
      defaultValue: 0.00
    },
    max_amount: {
      type: DataTypes.DOUBLE(10,2),
      allowNull: false,
      defaultValue: 0.00
    },
    promo_description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expiration: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('ADDED','EXPIRED'),
      allowNull: false
    }
  }, {
    tableName: 'promocodes',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
