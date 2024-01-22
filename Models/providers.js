const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return Providers.init(sequelize, DataTypes);
};

class Providers extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define(
      "Providers",
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        first_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        last_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: "providers_email_unique",
        },
        gender: {
          type: DataTypes.ENUM("MALE", "FEMALE"),
          allowNull: false,
          defaultValue: "MALE",
        },
        mobile: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        country_code: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        avatar: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        rating: {
          type: DataTypes.DECIMAL(4, 2),
          allowNull: false,
          defaultValue: 5.0,
        },
        status: {
          type: DataTypes.ENUM(
            "document",
            "card",
            "onboarding",
            "approved",
            "banned"
          ),
          allowNull: false,
          defaultValue: "document",
        },
        fleet: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        latitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: true,
        },
        longitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: true,
        },
        stripe_acc_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        stripe_cust_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        otp: {
          type: DataTypes.MEDIUMINT,
          allowNull: false,
          defaultValue: 0,
        },
        wallet_balance: {
          type: DataTypes.DOUBLE(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        remember_token: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        login_by: {
          type: DataTypes.ENUM("manual", "facebook", "google", "apple"),
          allowNull: true,
        },
        social_unique_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        availability_status: {
          type: DataTypes.ENUM("online", "offline"),
          allowNull: false,
          defaultValue: "offline",
        },
        connection_status: {
          type: DataTypes.ENUM("ForHire", "Hired"),
          allowNull: false,
          defaultValue: "ForHire",
        },
        location_timestamp: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        firebase_user_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        tableName: "providers",
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
            name: "providers_email_unique",
            unique: true,
            using: "BTREE",
            fields: [{ name: "email" }],
          },
        ],
      }
    );
  }
}
