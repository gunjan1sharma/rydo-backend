const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return ProviderVouch.init(sequelize, DataTypes);
}

class ProviderVouch extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            "ProviderVouch",
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
                escrow_id: {
                    type: DataTypes.STRING(45),
                    allowNull: false,
                },
                user_ref: {
                    type: DataTypes.STRING(45),
                    allowNull: false,
                },
                vouch_status: {
                    type: DataTypes.ENUM('DUES_PAID', 'DUES_NOT_PAID', 'OTHER', 'NEW'),
                    allowNull: true,
                },
                total_amt_due: {
                    type: DataTypes.DOUBLE(10, 2),
                    allowNull: true
                }
                // conv_fee_amt_due: {
                //     type: DataTypes.DOUBLE(10, 2),
                //     allowNull: true
                // },
                // sub_fee_amt_due: {
                //     type: DataTypes.DOUBLE(10, 2),
                //     allowNull: true
                // }
            },
            {
                tableName: "provider_vouch",
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
                        name: "FK_PROVIDER_25",
                        using: "BTREE",
                        fields: [{ name: "provider_id" }],
                    },
                ],
            }
        );
    }
}
