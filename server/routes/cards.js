const querystring = require('querystring');
const url = require('url');
const scrape = require('../database/scrape');
const database = require('../database/database');
const express = require('express');
const router = express.Router();

// Remember: The GET url to access this is '/cards'
router.get('/', (req, res) => {
    database.getAllCards().then((cards) => {
        // scrape.getCards().then((cards) => {
        res.render('cards.html', {
            cards: cards,
            total: cards.length
        })
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/paginate', (req, res) => {
    database.getCardsPaginated()
    .then((cards) => {
        res.render('cards.html', {
            cards: cards
        });
    });
});

// TODO: THIS MUST BE IMPLEMENTED AS A POST REQUEST
router.get('/update-collection', (req, res) => {
    Promise.all([scrape.getCards(), database.getAllCards()])
    .then((cards) => {
        let newCards = cards[0];
        let oldCards = cards[1];
        let newProduct = [];

        //TODO: Optimize this insane list diff going on here. It works but...
        // Logic:
        // if the price OR qty of a new product has changed,
        // update the card with new price and/or qty
        // if the new card does not exist in the db
        // add the card to the db
        newCards.forEach((newCard) => {
            // Diffing for title equality, set code equality and quantity change
            oldCards.forEach((oldCard) => {
                if (newCard.title === oldCard.title
                    && newCard.quantity !== oldCard.quantity
                    && newCard.setCode === oldCard.setCode
                    && newCard.rarity === oldCard.rarity) {
                    newProduct.push(newCard);
                    // TODO: should remove the card from the array to make searching faster
                    // Update the card in the database
                    database.updateCard(newCard);
                }
            })
            // Finds if new card's title is present in the old card list
            let cardIsPresent = oldCards.findIndex((oldCard) => {
                return oldCard.title === newCard.title && oldCard.setCode === newCard.setCode;
            });
            // If the new card's title is not present, then add to newProduct list
            if (cardIsPresent < 0) {
                console.log('the card we pushed:')
                console.log(newCard);
                newProduct.push(newCard);
                // Add the card to the database
                database.createCard(newCard);
            }
        });
        res.render('cards.html', {
            cards: newProduct
        });
    }).catch((error) => {
        console.log(error);
    })
})

// when "update cards" is pressed, need to return new product
// add "new" badge to new product divs and sort by new
// add cards to firebase
// TODO: need to update the new card/updated card's updateDate

router.get('/search', (req, res) => {
    let parsedUrl = url.parse(req.url);
    let parsedQuery = querystring.parse(parsedUrl.query);

    database.getCardByTitle(parsedQuery.title)
    .then((card) => {
        console.log('searched card sent');
        res.send(card);
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/update-card', (req, res) => {
    database.updateCard(req.query)
    .then((card) => {
        res.send("this worked");
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/new-product', (req, res) => {
    // Grabs the new card list from RDG, and the old cards in Firebase
    Promise.all([scrape.getCards(), database.getAllCards()])
    .then((cards) => {
        let newCards = cards[0];
        let oldCards = cards[1];
        let newProduct = [];

        newCards.forEach((newCard) => {
            oldCards.forEach((oldCard) => {
                if (newCard.title === oldCard.title 
                    && newCard.quantity > oldCard.quantity
                    && newCard.setCode === oldCard.setCode
                    && newCard.rarity === oldCard.rarity) {
                    newProduct.push(newCard);
                }
            })
        });

        // make sure to write the new product to the DB once this actually works
        res.render('cards.html', {
            cards: newProduct
        });
    }).catch((err) => {
        console.log(err);
    })
});

router.get('/seed', (req, res) => {
    // seed scraped card data to firebase
    scrape.getCards().then((cards) => {
        database.removeAllCards();
        cards.forEach((card) => {
            database.createCard(card);
        });
    }).then(() => {
        res.send('Scrape & Seed Completed');
    }).catch((err) => {
        console.log(err);
    })
});

module.exports = router;