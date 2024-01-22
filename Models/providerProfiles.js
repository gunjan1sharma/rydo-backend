const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return ProviderProfiles.init(sequelize, DataTypes);
}

class ProviderProfiles extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define('ProviderProfiles', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      provider_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'providers',
          key: 'id'
        }
      },
      language: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      address_secondary: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      country: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      postal_code: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      tableName: 'provider_profiles',
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
          name: "FK_PROVIDERS_4_idx",
          using: "BTREE",
          fields: [
            { name: "provider_id" },
          ]
        },
      ]
    });
  }
}
