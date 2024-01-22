const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Times.init(sequelize, DataTypes);
}

class Times extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('Times', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    from_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    to_time: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: 'times',
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
