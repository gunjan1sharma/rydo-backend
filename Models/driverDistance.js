const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return DriverDistance.init(sequelize, DataTypes);
};

class DriverDistance extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define(
      "DriverDistance",
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        driverID: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "providers",
            key: "id",
          },
        },
        poiID: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "poi_constants",
            key: "id",
          },
        },
        service_type_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: "service_types",
            key: "id",
          },
        },
        provider_services_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: "provider_services",
            key: "id",
          },

        },
        distance: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
        },
      },
      {
        tableName: "driver_distance",
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
            name: "rydo_db_v2_driver_distance1",
            using: "BTREE",
            fields: [{ name: "poiID" }],
          },
          {
            name: "rydo_db_v2_driver_distance2",
            using: "BTREE",
            fields: [{ name: "driverID" }],
          },
          {
            name: "FK_SERVICE_TYPE_3",
            using: "BTREE",
            fields: [{ name: "service_type_id" }],
          },
          {
            name: "FK_PROVIDER_SERVICES_3",
            using: "BTREE",
            fields: [{ name: "provider_services_id" }],
          },
        ],
      }
    );
  }
}
