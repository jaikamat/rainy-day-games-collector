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
async function updateCard(id, qty) {
    if (!qty) {
        throw new Error('Quantity is required to update a card');
    }
    if (!id) {
        throw new Error('Id is required to update a card');
    }

    const quantity = Number(qty);

    if (isNaN(quantity)) {
        throw new Error('Quantity was not correct');
    }
    if (quantity < 0) {
        throw new Error('Negative cards are not possible');
    }
    if (!Number.isInteger(quantity)) {
        throw new Error('Quantity must be an integer value');
    }

    return await Card.findOne({
        where: { card_id: id }
    }).then(card => {
        return CardInventory.update({
            quantity: quantity
        }, {
            where: {
                cardInventory_id: card.cardInventory_id
            }
        })
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

/**
 * Retrieves a slice of data from the Cards table; for pagination
 * @param {*} pageNumber The requested page number
 * @param {*} numRecords The limit; number of records to retrieve
 */
async function getCardsPaginated(pageNumber, numRecords) {
    let page = pageNumber;
    let offset = 0;
    
    let cards = await Card.findAndCountAll()
    let pages = Math.ceil(cards.count / numRecords);
    offset = numRecords * (page - 1);

    let cardsPage = await Card.findAll({
        limit: numRecords,
        offset: offset
    });

    return {
        count: cards.count,
        pages: pages,
        cards: cardsPage
    }
}

module.exports.getCardByTitle = getCardByTitle;
module.exports.getAllCards = getAllCards;
module.exports.updateCard = updateCard;
module.exports.createCard = createCard;
module.exports.getCardsPaginated = getCardsPaginated;