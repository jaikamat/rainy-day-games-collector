const Card = require("../models").card;
const UserCard = require("../models").userCard;

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
        include: [
            {
                model: Card
            }
        ]
    });
}

/**
 * Creates a userCard record tying a user to a card in their wishlist
 * @param {Integer} userId
 * @param {Integer} cardId
 * @returns The created record
 * NOTE: findOrCreate is broken using sqlite3 for some reason...
 */
async function addCardToWishlist(userId, cardId) {
    return await UserCard.find({
        where: {
            user_id: userId,
            card_id: cardId
        }
    }).then(found => {
        if (!found) {
            return UserCard.create({
                user_id: userId,
                card_id: cardId
            });
        } else {
            throw new Error("Card already exists in wishlist");
        }
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

module.exports.addCardToWishlist = addCardToWishlist;
module.exports.getWishlist = getWishlist;
module.exports.deleteCardFromWishlist = deleteCardFromWishlist;
