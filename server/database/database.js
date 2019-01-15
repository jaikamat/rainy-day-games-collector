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
 * TODO: need to update price here as well, and check for NaN values
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

async function getAllCardsPaginate(pageNo, title) {
    // get no. of records
    // let title = title ? title : null;

    // divide that by size to get numpages
    let pageCards = [];

    let first = await db.ref('cards')
    .orderByChild('title')
    .limitToFirst(pageNo * 10).once('value', (snapshot) => {
        // console.log(snapshot.val());
        snapshot.forEach((snap) => {
            pageCards.push(snap.val());
            console.log(snap.key);
        })
    });
    // console.log(pageCards);
    return pageCards;
}

module.exports.getCardByTitle = getCardByTitle;
module.exports.getAllCards = getAllCards;
module.exports.updateCard = updateCard;
module.exports.createCard = createCard;
module.exports.removeAllCards = removeAllCards;
module.exports.getAllCardsPaginate = getAllCardsPaginate;