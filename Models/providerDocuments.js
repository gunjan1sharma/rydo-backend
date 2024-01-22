const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return ProviderDocuments.init(sequelize, DataTypes);
}

class ProviderDocuments extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define(
    "ProviderDocuments",
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
      document_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "documents",
          key: "id",
        },
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      unique_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("ASSESSING", "ACTIVE"),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "provider_documents",
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
          name: "FK_PROVIDERS_3_idx",
          using: "BTREE",
          fields: [{ name: "provider_id" }],
        },
        {
          name: "FK_DOCUMENTS_3_idx",
          using: "BTREE",
          fields: [{ name: "document_id" }],
        },
      ],
    }
  );
  }
}
