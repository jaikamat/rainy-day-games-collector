const Card = require('../models').card;
const sequelize = require('../models').sequelize;
const rdgUpdate = require('../rdg_update');
const models = require('../models');

/**
 * Writes a card object to the card table
 * @param {Object} card The card object to create
 * @returns Nothing
 */
async function createCard(card) {
    await Card.create(card);
}

/**
 * Updates a card's `quantity`, `foilQuantity`, and/or `price`
 * @param {String} id The card database id
 * @param {Object} props The card object with desired properties
 * @returns The affected card record
 */
async function updateCard(id, props) {
    if (!id) throw new Error('id is required to update a card');

    let updateProps = {};

    if (props.quantity) updateProps.quantity = validateQuantity(props.quantity);
    if (props.foilQuantity) updateProps.foilQuantity = validateQuantity(props.foilQuantity);
    if (props.price) updateProps.price = validatePrice(props.price);

    let updatedCard = await Card.update(
        updateProps,
        {
            where: { card_id: id },
            returning: true  // Returns the updated entry (Postgres only)
        }
    )
    
    return updatedCard[1][0].dataValues;
}

/**
 * Utility function that throws errors for illegal quantities
 * @param {String} qty A string to be parsed to an integer
 * @returns An integer value
 */
function validateQuantity(qty) {
    let qtyConvert = Number(qty);

    if (isNaN(qtyConvert)) throw new Error('Quantity was not correct');
    if (qtyConvert < 0) throw new Error('Negative quantities are not possible');
    if (!Number.isInteger(qtyConvert)) throw new Error('Quantity must be an integer value');

    return qtyConvert;
}

/**
 * Utility function that throws errors for illegal prices
 * @param {String} price A string to be parsed to a number
 * @returns A number
 */
function validatePrice(price) {
    let priceConvert = Number(price);

    if (isNaN(priceConvert)) throw new Error('Price was not correct');
    if (priceConvert < 0) throw new Error('Negative prices are not possible');

    return priceConvert;
}

/**
 * Queries the card table for a card by title
 * @param {String} title The case sensitive card title
 * @returns Returns an array of values
 */
async function getCardByTitle(title) {
    return await Card.findAll({
        where: { title: title }
    });
}

/**
 * Queries the database for a number of defined card properties
 * @param {Object} search The request body with query properties
 * @returns Returns an array of cards
 */
async function getCardsDynamic(search) {
    let where = {};
    let priceRange = {}; // To fill with Sequelize's string operators - https://sequelize.readthedocs.io/en/2.0/docs/querying/

    if (search.title) where.title = search.title;
    if (search.scryfall_id) where.scryfall_id = search.scryfall_id;
    if (search.card_id) where.card_id = search.card_id;
    if (search.setCode) where.setCode = search.setCode;
    if (search.lowPrice) priceRange.$gte = search.lowPrice; // Sequelize >= operator
    if (search.highPrice) priceRange.$lte = search.highPrice; // Sequelize <= operator

    where.price = { $and: priceRange }; // Sequelize AND operator

    return await Card.findAll({
        where: where
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

// TODO: This function MUST capture errors and write them to a separate file for analysis
/**
 * Merges data from RDG's json into the local database, one set at a time
 * @param {String} setCode The 3-letter mtg expansion code
 */
async function updateCardsFromRDG(setCode) {
    if (!setCode) {
        throw new Error('Set code is required to update');
    }
    return await rdgUpdate.updateScryfallWithRDG(models, setCode);
}

module.exports.getCardByTitle = getCardByTitle;
module.exports.getCardsBySubstr = getCardsBySubstr;
module.exports.getAllCards = getAllCards;
module.exports.updateCard = updateCard;
module.exports.createCard = createCard;
module.exports.getCardsPaginated = getCardsPaginated;
module.exports.getCardsDynamic = getCardsDynamic;
module.exports.updateCardsFromRDG = updateCardsFromRDG;