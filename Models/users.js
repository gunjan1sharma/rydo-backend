const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return Users.init(sequelize, DataTypes);
};

class Users extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return sequelize.define(
      "Users",
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
        payment_mode: {
          type: DataTypes.ENUM("CASH", "CARD", "PAYPAL"),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: "users_email_unique",
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
        password: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        picture: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        device_token: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        device_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        device_type: {
          type: DataTypes.ENUM("android", "ios"),
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
        latitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: true,
        },
        longitude: {
          type: DataTypes.DOUBLE(15, 8),
          allowNull: true,
        },
        stripe_cust_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        wallet_balance: {
          type: DataTypes.DOUBLE(8, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        rating: {
          type: DataTypes.DECIMAL(4, 2),
          allowNull: false,
          defaultValue: 5.0,
        },
        otp: {
          type: DataTypes.MEDIUMINT,
          allowNull: false,
          defaultValue: 0,
        },
        language: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        remember_token: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        country_code: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        firebase_user_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        user_source: {
          type: DataTypes.STRING(45),
          allowNull: true,
          defaultValue: "INTERNAL",
        },
      },
      {
        tableName: "users",
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
            name: "users_email_unique",
            unique: true,
            using: "BTREE",
            fields: [{ name: "email" }],
          },
        ],
      }
    );
  }
}
