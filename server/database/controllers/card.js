const Card = require('../models').card;
const CardInventory = require('../models').cardInventory;

/**
 * Writes a card object to the card table
 * @param {Object} card The card object to create
 * @returns Nothing
 */
async function createCard(card) {
    await Card.create(card);
}

/**
 * Updates a card's `quantity` in the card table
 * @param {Object} card The card object with desired properties
 * @returns The affected card record
 */
async function updateCard(id, quantity) {
    if (!id) {
        throw new Error('Id is required to update a card');
    }
    if (isNaN(quantity)) {
        throw new Error('Quantity was not correct');
    }
    if (!quantity) {
        throw new Error('Quantity is required to update a card');
    }

    return await Card.update({
        quantity: quantity
    }, {
        where: {
            card_id: id
        }
    }).then((affectedRows) => {
        if (affectedRows[0] === 0) {
            return "No cards were updated"
        } else {
            // Return the card that was updated - must re-query
            return Card.findOne({
                where: { card_id: id },
                include: [{ model: CardInventory }]
            });
        }
    });
}

/**
 // TODO: Possibly have this method be more modular and take more search params
 * Queries the card table for a card by title
 * @param {String} title The case sensitive card title
 * @returns Returns an array of values
 */
async function getCardByTitle(title) {
    return Card.findAll({
        where: { title: title },
        include: [{ model: CardInventory }]
    });
}

/**
 * Retrieves all the cards stored in database instance
 * @returns Returns an array of card objects
 */
async function getAllCards() {
    return await Card.findAll({
        include: [{
            model: CardInventory
        }]
    });
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