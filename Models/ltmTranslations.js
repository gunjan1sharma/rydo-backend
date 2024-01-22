const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return LtmTranslations.init(sequelize, DataTypes);
}

class LtmTranslations extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define('LtmTranslations', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    locale: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    group: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'ltm_translations',
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
