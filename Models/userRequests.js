const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return UserRequests.init(sequelize, DataTypes);
};

class UserRequests extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define(
      "UserRequests",
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        booking_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        user_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
        },
        provider_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          references: {
            model: "providers",
            key: "id",
          },
        },
        current_provider_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
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
        promocode_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: "promocodes",
            key: "id",
          },
        },
        rental_hours: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM(
            "SEARCHING",
            "CANCELLED",
            "ACCEPTED",
            "STARTED",
            "ARRIVED",
            "PICKEDUP",
            "DROPPED",
            "COMPLETED",
            "SCHEDULED",
            "NO_DRIVERS_FOUND",
            "NO_DRIVER_ACCEPTED"
          ),
          allowNull: false,
        },
        cancelled_by: {
          type: DataTypes.ENUM("NONE", "USER", "PROVIDER"),
          allowNull: false,
        },
        cancel_reason: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        payment_mode: {
          type: DataTypes.ENUM("CASH", "CARD", "PAYPAL"),
          allowNull: true,
        },
        service_required: {
          type: DataTypes.ENUM("none", "outstation"),
          allowNull: true,
        },
        paid: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
        },
        is_track: {
          type: DataTypes.ENUM("YES", "NO"),
          allowNull: false,
          defaultValue: "NO",
        },
        distance: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
        },
        travel_time: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        unit: {
          type: DataTypes.ENUM("Kms", "Miles"),
          allowNull: false,
          defaultValue: "Kms",
        },
        s_address: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        s_latitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
        },
        s_longitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
        },
        d_address: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        otp: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        otp_verified: {
          type: DataTypes.ENUM("TRUE", "FALSE"),
          allowNull: true,
          defaultValue: "FALSE",
        },
        d_latitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
        },
        track_distance: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
          defaultValue: 0.0,
        },
        track_latitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
          defaultValue: 0.0,
        },
        track_longitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
          defaultValue: 0.0,
        },
        d_longitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
        },
        assigned_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        schedule_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        started_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        finished_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        is_scheduled: {
          type: DataTypes.ENUM("YES", "NO"),
          allowNull: false,
          defaultValue: "NO",
        },
        user_rated: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
        },
        provider_rated: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
        },
        use_wallet: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
        },
        surge: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
        },
        route_key: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        estimated_fare: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: false,
          defaultValue: 0.0,
        },
        a_latitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: true,
        },
        a_longitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: true,
        },
        transaction_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        d_eloc: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
      },
      {
        tableName: "user_requests",
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
            name: "FK_PROVIDERS_14_idx",
            using: "BTREE",
            fields: [{ name: "provider_id" }],
          },
          {
            name: "FK_USERS_14_idx",
            using: "BTREE",
            fields: [{ name: "user_id" }],
          },
          {
            name: "FK_PROVIDERS_15_idx",
            using: "BTREE",
            fields: [{ name: "current_provider_id" }],
          },
          {
            name: "FK_SERVICE_TYPES_3_idx",
            using: "BTREE",
            fields: [{ name: "service_type_id" }],
          },
          {
            name: "FK_PROMOCODES_5_idx",
            using: "BTREE",
            fields: [{ name: "promocode_id" }],
          },
          {
            name: "idx_user_requests_status",
            using: "BTREE",
            fields: [{ name: "status" }],
          },
        ],
      }
    );
  }
}
