const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Works.init(sequelize, DataTypes);
}

class Works extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Works', {
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
    age: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    work: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'works',
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
