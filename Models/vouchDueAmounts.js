const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return VouchDueAmounts.init(sequelize, DataTypes);
}

class VouchDueAmounts extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "VouchDueAmounts",
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
                convenience_fee: {
                    type: DataTypes.DOUBLE(10, 2),
                    allowNull: true,
                },
                subscription_fee: {
                    type: DataTypes.DOUBLE(10, 2),
                    allowNull: true,
                },
                due_for_date: {
                    type: DataTypes.DATE,
                    allowNull: true
                }
            },
            {
                tableName: "vouch_due_amounts",
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
                        name: "FK_PROVIDER_29",
                        using: "BTREE",
                        fields: [{ name: "provider_id" }],
                    },
                ],
            }
        );
    }
}
