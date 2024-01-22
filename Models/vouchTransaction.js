const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return VouchTransaction.init(sequelize, DataTypes);
}

class VouchTransaction extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "VouchTransaction",
            {
                id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: false,
                    primaryKey: true,
                },
                source_escrow_id: {
                    type: DataTypes.STRING(45),
                    allowNull: true

                },
                source_user_ref: {
                    type: DataTypes.STRING(45),
                    allowNull: true

                },
                provider_id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: true,
                    references: {
                        model: "providers",
                        key: "id",
                    },
                },
                transaction_ID: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                transaction_date: {
                    type: DataTypes.DATE,
                    allowNull: true,

                },
                transaction_amount: {
                    type: DataTypes.DOUBLE(10, 2),
                    allowNull: true,
                },
                target_escrow_id: {
                    type: DataTypes.STRING(45),
                    allowNull: true

                },
                target_user_ref: {
                    type: DataTypes.STRING(45),
                    allowNull: true

                },
                transaction_status: {
                    type: DataTypes.ENUM('SUCCESS', 'FAILURE', 'OTHER'),
                    allowNull: true,
                },
            },
            {
                tableName: "vouch_transaction",
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
                        name: "FK_PROVIDER_27",
                        using: "BTREE",
                        fields: [{ name: "provider_id" }],
                    },
                ],
            }
        );
    }
}
