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

Card.sequelize.sync()
.then(() => {
    console.log('Cards table synced');
}).catch((error) => {
    console.log('There was an error syncing the Cards table')
});

module.exports = Card;