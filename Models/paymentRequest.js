const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return PaymentRequest.init(sequelize, DataTypes);
}

class PaymentRequest extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "PaymentRequest",
            {
                id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: false,
                    primaryKey: true,
                },
                provider_id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: true,
                    references: {
                        model: "providers",
                        key: "id",
                    },
                },
                generated_link: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                generated_date: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                request_amount: {
                    type: DataTypes.DOUBLE(10, 2)
                }
            },
            {
                tableName: "payment_request",
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
                        name: "FK_PROVIDER_31",
                        using: "BTREE",
                        fields: [{ name: "provider_id" }],
                    },
                ],
            }
        );
    }
}
