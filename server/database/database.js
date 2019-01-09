const firebase = require('firebase-admin');

let serviceAccount = require(__dirname + '/../keys/rainy-day-games-searcher-firebase-adminsdk-z7jgg-efcf1425fb.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://rainy-day-games-searcher.firebaseio.com" 
});

const db = firebase.database();

/**
 * Writes a card object to Firebase under the ref 'cards'
 * @param {Object} card The card object to create
 * @returns Returns the key of the created card
 */
async function createCard(card) {
    return await db.ref('cards').push(card);
}

/**
 * Updates a card in Firebase
 * @param {Object} card The card object with desired properties
 * @returns Returns the card object
 */
async function updateCard(card) {
    let cardToUpdate = await db.ref('cards')
    .orderByChild('title').equalTo(card.title)
    .once('child_added', (snapshot) => {
        snapshot.ref.update({
            quantity: Number(card.quantity)
        });
    });
    return cardToUpdate.val();
}

/**
 // TODO: implement some error handling for null values
 // TODO: Possibly have this method be more modular and take more search params
 * Queries Firebase for a card by title
 * @param {String} title The case sensitive card title
 * @returns Returns object or `null` for not found
 */
async function getCardByTitle(title) {
    let card = await db.ref('cards')
    .orderByChild('title').equalTo(title)
    .once('value', (snapshot) => {
        return snapshot.val();
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

module.exports.getCardByTitle = getCardByTitle;
module.exports.getAllCards = getAllCards;
module.exports.updateCard = updateCard;
module.exports.createCard = createCard;