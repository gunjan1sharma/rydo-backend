const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return ProviderServices.init(sequelize, DataTypes);
}

class ProviderServices extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define(
    "ProviderServices",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      provider_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "providers",
          key: "id",
        },
      },
      service_type_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "service_types",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("active", "offline", "riding"),
        allowNull: false,
      },
      service_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      service_model: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "provider_services",
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
        {
          name: "FK_PROVIDERS_5_idx",
          using: "BTREE",
          fields: [{ name: "provider_id" }],
        },
        {
          name: "FK_SERVICE_TYPES_1_idx",
          using: "BTREE",
          fields: [{ name: "service_type_id" }],
        },
      ],
    }
  );
  }
}
