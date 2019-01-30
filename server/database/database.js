const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    storage: './cardsDatabase.db'
});

sequelize.authenticate()
.then(() => {
    console.log('A connection to the database has been established');
}).catch(() => {
    console.log('Database not found');
})

const Card = sequelize.define('card', {
    isFlip: { type: Sequelize.BOOLEAN },
    color: { type: Sequelize.STRING },
    rarity: { type: Sequelize.STRING },
    title: { type: Sequelize.STRING },
    setCode: { type: Sequelize.STRING },
    price: { type: Sequelize.DECIMAL },
    quantity: { type: Sequelize.INTEGER }
});

// Card.sync({ force: true })
// .then(() => {
//     return Card.create({
//         isFlip: false,
//         color: 'W',
//         rarity: 'R',
//         title: 'Rule of Law',
//         setCode: 'RNA',
//         price: 15.66,
//         quantity: 3
//     });
// }).then(() => {
//     Card.findAll()
//     .then((card) => {
//         console.log(card);
//     }).catch((error) => {
//         console.log(error);
//     })
// })

/**
 * Writes a card object to sqlite3
 * @param {Object} card The card object to create
 * @returns Nothing
 */
async function createCard(card) {
    await Card.create(card);
}

/**
 * Updates a card's `quantity` in sqlite3
 * @param {Object} card The card object with desired properties
 * @returns The affected card record
 */
async function updateCard(card) {
    if (!card.hasOwnProperty('quantity')) {
        throw new Error('Quantity was not provided');
    }
    if (isNaN(card.quantity)) {
        throw new Error('Quantity was not correct');
    }
    if (!card.hasOwnProperty('setCode')) {
        throw new Error('Set Code is required to update a card')
    }

    return await Card.update({
        quantity: card.quantity
    }, {
        where: {
            title: card.title,
            setCode: card.setCode
        }
    }).then((affectedRows) => {
        if (affectedRows[0] === 0) {
            return "No cards were updated"
        } else {
            // Return the card that was updated - must re-query
            return Card.findOne({
                where: {
                    title: card.title,
                    setCode: card.setCode
                }
            });
        }
    });
}

/**
 // TODO: Possibly have this method be more modular and take more search params
 * Queries Firebase for a card by title
 * @param {String} title The case sensitive card title
 * @returns Returns an array of values
 */
async function getCardByTitle(title) {
    return Card.findAll({
        where: { title: title }
    });
}

/**
 * Retrieves all the cards stored in sqlite3
 * @returns Returns an array of card objects
 */
async function getAllCards() {
    return await Card.findAll();
}

// TODO: Flesh out the user sort queries to minimize code as well as errors
async function getCardsPaginated(childProperty, key, sortBy) {
    // TODO: re-code this with updatedAt and title sort
}

module.exports.getCardByTitle = getCardByTitle;
module.exports.getAllCards = getAllCards;
module.exports.updateCard = updateCard;
module.exports.createCard = createCard;
module.exports.getCardsPaginated = getCardsPaginated;