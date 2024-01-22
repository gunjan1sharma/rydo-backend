const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return Documents.init(sequelize, DataTypes);
}

class Documents extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define(
    "Documents",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("DRIVER", "VEHICLE"),
        allowNull: false,
      },
    },
    {
      tableName: "documents",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  }
}
