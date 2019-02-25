const Card = require('../models').card;
const sequelize = require('../models').sequelize;

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
    
    let updatedCard = await Card.update(
        { quantity: quantity },
        {
            where: { card_id: id },
            returning: true  // Returns the updated entry (Postgres only)
        }
    )
    
    return updatedCard[1][0].dataValues;
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
 * TODO: Convert to ORM-based query
 * Executes a raw sql query to search for cards based on partial string matches
 * @param {String} str The search string
 * @returns Returns an array of cards
 */
async function getCardsBySubstr(str) {
    if (!str) {
        throw new Error('Search string must be provided');
    }
    if (str.length < 3) {
        throw new Error('Must search on at least 3 characters');
    }

    // Create a regex string to insert into a native sql query
    let queryStr = str.trim().split(' ').join('%') + '%';

    return await sequelize.query(
        `SELECT *
        FROM card
        WHERE LOWER(title) LIKE LOWER(:string)
        ORDER BY title;`
    , { replacements: { string: queryStr }, type: sequelize.QueryTypes.SELECT });
}

/**
 * Retrieves all the cards stored in database instance
 * @returns Returns an array of card objects
 */
async function getAllCards() {
    return await Card.findAll();
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

// see https://github.com/sequelize/sequelize/issues/2077
// and https://github.com/sequelize/sequelize/issues/4322
// TODO: This function MUST capture errors and write them to a separate file for analysis

async function updateCardsFromRDG(cardArray) {
    return await Promise.all(cardArray.map(el => {
        let cardTitleRegex = el.title.toLowerCase().trim().split(' ').join('%') + '%';
        let setCode = el.setCode.toLowerCase().trim();
        let price = el.price;
        let quantity = el.quantity;

        return Card.update({
            price: price,
            quantity: quantity
        }, {
            where: {
                $and: [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('title')),
                        { like: cardTitleRegex }
                    ),
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('setCode')),
                        setCode
                    )
                ]
            },
            // returning: true
        });
    }))
}

module.exports.getCardByTitle = getCardByTitle;
module.exports.getCardsBySubstr = getCardsBySubstr;
module.exports.getAllCards = getAllCards;
module.exports.updateCard = updateCard;
module.exports.createCard = createCard;
module.exports.getCardsPaginated = getCardsPaginated;
module.exports.updateCardsFromRDG = updateCardsFromRDG;