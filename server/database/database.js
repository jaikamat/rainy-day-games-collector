const firebase = require('firebase-admin');
const moment = require('moment');

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
 * Writes a card object to Firebase under the ref 'cards'
 * @param {Object} card The card object to create
 * @returns Returns the key of the created card
 */
async function createCard(card) {
    // Add a timestamp to the card object
    card.timestamp = moment().unix();
    return await db.ref('cards').push(card);
}

/**
 * Updates a card's `quantity` in Firebase
 * @param {Object} card The card object with desired properties
 * @returns Returns the card object
 */
async function updateCard(card) {
    // TODO: add error handling and type checking to the req.query before updating
    let cardToUpdate = await db.ref('cards')
    .orderByChild('title')
    .equalTo(card.title)
    .once('child_added', (snapshot) => {
        snapshot.ref.update({
            // Update timestamp on card update
            timestamp: moment().unix(),
            quantity: Number(card.quantity)
        });
    });

    // Add key to updated card and return
    let returnCard = cardToUpdate.val();
    returnCard.key = cardToUpdate.key;

    return returnCard;
}

/**
 // TODO: implement some error handling for null values
 // TODO: Possibly have this method be more modular and take more search params
 * Queries Firebase for a card by title
 * @param {String} title The case sensitive card title
 * @returns Returns object or `null` for not found
 */
async function getCardByTitle(title) {
    let card;
    
    await db.ref('cards')
    .orderByChild('title')
    .equalTo(title)
    .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            card = childSnapshot.val();
            card.key = childSnapshot.key;
        });
    });
    return card;
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