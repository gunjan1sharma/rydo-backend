const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return FavouriteLocations.init(sequelize, DataTypes);
}

class FavouriteLocations extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define('FavouriteLocations', {
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
      address: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      latitude: {
        type: DataTypes.DOUBLE(15, 8),
        allowNull: true
      },
      longitude: {
        type: DataTypes.DOUBLE(15, 8),
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('home', 'work', 'recent', 'others'),
        allowNull: false,
        defaultValue: "others"
      },
      eloc: {
        type: DataTypes.STRING(10),
        allowNull: true
      }
    }, {
      tableName: 'favourite_locations',
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
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
          name: "FK_USERS_3_idx",
          using: "BTREE",
          fields: [
            { name: "user_id" },
          ]
        },
      ]
    });
  }
}
