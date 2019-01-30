const firebase = require('firebase-admin');

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


let serviceAccount = require(__dirname + '/../keys/rainy-day-games-searcher-firebase-adminsdk-z7jgg-efcf1425fb.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://rainy-day-games-searcher.firebaseio.com" 
});

const db = firebase.database();

/**
 * Removes all entries at the 'cards' ref
 * Used only during seeding 
 */
async function removeAllCards() {
    console.log('All cards removed');
    return await db.ref('cards').remove();
}

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
 * Retrieves all the cards stored in Firebase
 * @returns Returns all card objects, with keys
 */
async function getAllCards() {
    let cards = [];
    await db.ref('cards').once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            let card = childSnapshot.val();
            card.key = childSnapshot.key;
            cards.push(card);
        })
    });
    return cards;
}

// TODO: Flesh out the user sot queries to minimize code as well as errors
async function getCardsPaginated(childProperty, key, sortBy) {
    let pageCards = [];

    if (!sortBy || sortBy === 'alphabetical') {
        await db.ref('cards')
        .orderByChild('title')
        .startAt(childProperty, key) // This is optional, will return first entries if not specified
        .limitToFirst(10)
        .once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                let card = childSnapshot.val();
                card.key = childSnapshot.key;
                pageCards.push(card);
            });
        });
    } else if (sortBy === 'timestamp') {
        // returns sorted cards in descending timestamp order
        await db.ref('cards')
        .orderByChild('timestamp')
        // .startAt(childProperty, key) // Somehow this isn't working when passed `null` arguments, unlike the above
        .limitToLast(100)
        .once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                let card = childSnapshot.val();
                card.key = childSnapshot.key;
                pageCards.push(card);
            })
            pageCards.reverse(); // Firebase has no way to sort queries in descending order
        });
    }
    return pageCards;
}

module.exports.getCardByTitle = getCardByTitle;
module.exports.getAllCards = getAllCards;
module.exports.updateCard = updateCard;
module.exports.createCard = createCard;
module.exports.removeAllCards = removeAllCards;
module.exports.getCardsPaginated = getCardsPaginated;