const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Eventcontacts.init(sequelize, DataTypes);
}

class Eventcontacts extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Eventcontacts', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mobile: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'eventcontacts',
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
    ]
  });
  }
}
