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

// TODO: THIS MUST BE IMPLEMENTED AS A POST REQUEST
router.get('/testing123', (req, res) => {
    // TODO: scrape, then add new cards in firebase

    Promise.all([scrape.getCards(), database.getAllCards()])
    .then((cards) => {
        let newCards = cards[0];
        let oldCards = cards[1];
        let newProduct = [];

        //TODO: Optimize this insane list diff going on here. It works but...
        newCards.forEach((newCard) => {
            // TODO: find its corresponding card in the oldcard list and update the qty in the db

            // diffing for title equality, st code equality and quantity increase
            oldCards.forEach((oldCard) => {
                if (newCard.title === oldCard.title 
                    && newCard.quantity > oldCard.quantity
                    && newCard.setCode === oldCard.setCode
                    && newCard.rarity === oldCard.rarity) {
                    newProduct.push(newCard);
                }
            })
            // finds if new card's title is present in the old card list
            let cardIsPresent = oldCards.findIndex((oldCard) => {
                return oldCard.title === newCard.title;
            });
            // if the new card's title is not present, then add to newProduct list
            if (cardIsPresent < 0) {
                console.log('the card we pushed:')
                console.log(newCard);
                newProduct.push(newCard);
                // TODO: add the card to the db here
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
    let parsedUrl = url.parse(req.url);
    let parsedQuery = querystring.parse(parsedUrl.query);

    database.updateCard(parsedQuery)
    .then((card) => {
        res.send("this worked");
    }).catch((error) => {
        res.send(error);
    });
})

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
    })
});

module.exports = router;