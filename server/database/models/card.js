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
    });

    // Create associations
    Card.associate = (models) => {
        Card.belongsToMany(models.user, { through: models.userCard });
    };

    return Card
};