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
        res.status(200);
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
        res.status(200);
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

        for (let i = 0; i < newCards.length; i++) { // Iterate over newly scraped data
            let index = oldCards.findIndex((el) => {
                return newCards[i].title === el.title // Title must be equal
                && newCards[i].setCode === el.setCode // Set Code must be equal
                && newCards[i].rarity === el.rarity // Rarity must be equal
            });

            if (index >= 0) { // Card was found
                if (newCards[i].quantity !== oldCards[index].quantity) { // Check for changes in quantity
                    newProduct.push(newCards[i]);
                    database.updateCard(newCards[i]);
                }
                oldCards.splice(index, 1); // Remove the card from the array to increase speed

            } else if (index === -1) { // If the index is not found, then add card to db
                newProduct.push(newCards[i]);
                database.createCard(newCards[i]);
            }
        }
        res.status(200);
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
        res.status(200);
        res.send(card);
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/update-card', (req, res) => {
    database.updateCard(req.query)
    .then((card) => {
        res.status(200);
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
        res.status(200);
        res.send('Scrape & Seed Completed');
    }).catch((err) => {
        console.log(err);
    })
});

module.exports = router;