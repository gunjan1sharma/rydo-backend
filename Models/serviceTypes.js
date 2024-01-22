const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return ServiceTypes.init(sequelize, DataTypes);
}

class ServiceTypes extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return sequelize.define(
    "ServiceTypes",
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
      provider_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      fixed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      minute: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      outstation_km: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      outstation_driver: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      roundtrip_km: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      hour: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      distance: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      calculator: {
        type: DataTypes.ENUM(
          "MIN",
          "HOUR",
          "DISTANCE",
          "DISTANCEMIN",
          "DISTANCEHOUR"
        ),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      user_convenience_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 1,
      },
      provider_subscription_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 1,
      },
    },
    {
      tableName: "service_types",
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
