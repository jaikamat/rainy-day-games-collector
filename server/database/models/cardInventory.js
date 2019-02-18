module.exports = (sequelize, Sequelize) => {
    const CardInventory = sequelize.define('cardInventory', {
        cardInventory_id: {
            autoincrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        card_id: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'card',
                key: 'card_id'
            }
        },
        price: {
            type: Sequelize.DECIMAL,
            defaultValue: 0
        },
        quantity: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });

    // Create associations
    CardInventory.associate = (models) => {
        CardInventory.belongsTo(models.card, { foreignKey: 'card_id' });
    };

    return CardInventory;
};