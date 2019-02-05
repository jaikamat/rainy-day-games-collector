const Card = require('../models').card;
const UserCard = require('../models').userCard;

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
 * Queries the card table for a card by title
 * @param {String} title The case sensitive card title
 * @returns Returns an array of values
 */
async function getCardByTitle(title) {
    return Card.findAll({
        where: { title: title }
    });
}

/**
 * Retrieves all the cards stored in database instance
 * @returns Returns an array of card objects
 */
async function getAllCards() {
    return await Card.findAll();
}

// TODO: Flesh out the user sort queries to minimize code as well as errors
async function getCardsPaginated(childProperty, key, sortBy) {
    // TODO: re-code this with updatedAt and title sort
}

/**
 * Retrieves all cards in the userCard table assigned to a user
 * @param {Integer} userId 
 * @returns userCard objects with cards populated
 */
async function getWishlist(userId) {
    return await UserCard.findAll({
        where: {
            user_id: userId
        },
        include: [{
            model: Card // Populates the card table data to the result
        }]
    });
}

/**
 * Creates a userCard record tying a user to a card in their wishlist
 * @param {Integer} userId
 * @param {Integer} cardId
 * @returns The created record
 */
async function addCardToWishlist(userId, cardId) {
    return await UserCard.create({
        user_id: userId,
        card_id: cardId
    });
}

/**
 * Removes a record from the userCard table
 * @param {Integer} userId
 * @param {Integer} cardId
 */
async function deleteCardFromWishlist(userId, cardId) {
    return await UserCard.destroy({
        where: {
            user_id: userId,
            card_id: cardId
        }
    });
}

module.exports.getCardByTitle = getCardByTitle;
module.exports.getAllCards = getAllCards;
module.exports.updateCard = updateCard;
module.exports.createCard = createCard;
module.exports.getCardsPaginated = getCardsPaginated;
module.exports.addCardToWishlist = addCardToWishlist;
module.exports.getWishlist = getWishlist;
module.exports.deleteCardFromWishlist = deleteCardFromWishlist;