const Sequelize = require('sequelize')
const sequelize = require('../initializedb');

const Card = sequelize.define('card', {
    isFlip: { type: Sequelize.BOOLEAN },
    color: { type: Sequelize.STRING },
    rarity: { type: Sequelize.STRING },
    title: { type: Sequelize.STRING },
    setCode: { type: Sequelize.STRING },
    price: { type: Sequelize.DECIMAL },
    quantity: { type: Sequelize.INTEGER }
});

module.exports = Card;