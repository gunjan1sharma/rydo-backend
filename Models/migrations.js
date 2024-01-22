const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Migrations.init(sequelize, DataTypes);
}

class Migrations extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Migrations', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    migration: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    batch: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'migrations',
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
