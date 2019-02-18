module.exports = (sequelize, Sequelize) => {
    const Card = sequelize.define('card', {
        card_id: {
            autoincrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        isFlip: { type: Sequelize.BOOLEAN },
        color: { type: Sequelize.STRING },
        rarity: { type: Sequelize.STRING },
        title: { type: Sequelize.STRING },
        setCode: { type: Sequelize.STRING },
        price: { type: Sequelize.DECIMAL },
        quantity: { type: Sequelize.INTEGER }
    }, {
        hooks: {
            afterSave: (card) => {
                for (key in card) {
                    if (key === 'attributes') {
                        console.log(card[key]);
                    }
                }
                // sequelize.models.cardInventory.create({
                //     card_id: card.card_id,
                //     price: 0,
                //     quantity: 0
                // })
            }
        }
    });

    // Create associations
    Card.associate = (models) => {
        Card.belongsToMany(models.user, { through: models.userCard });
        // Card.hasOne(models.cardInventory, { foreignKey: 'cardInventory_id' });
    };

    return Card
};