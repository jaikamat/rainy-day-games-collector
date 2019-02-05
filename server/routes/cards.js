const scrape = require('../database/scrape');
const cardController = require('../database/controllers/card');
const userCardController = require('../database/controllers/userCard');
const express = require('express');
const router = express.Router();

/**
 * User auth middleware, req.isAuthenticated is added by passportjs 
 */
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.send('THIS ROUTE IS FORBIDDEN');
    }
};

/**
 * User auth middleware, checks for isAdmin property on req.user 
 */
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    } else {
        res.send('THIS ROUTE IS FORBIDDEN - NO ADMIN');
    }
};

// Remember: The GET url to access this is '/cards'
router.get('/', (req, res) => {
    cardController.getAllCards().then((cards) => {
        // scrape.getCards().then((cards) => {
        res.status(200);
        res.send(cards);
    }).catch((error) => {
        res.status(500);
        res.send('ERROR MESSAGE!')
        console.log(error);
    });
});

router.get('/paginate', (req, res) => {
    cardController.getCardsPaginated()
    .then((cards) => {
        res.status(200);
        res.render('cards.html', {
            cards: cards
        });
    }).catch((error) => {
        res.status(500);
        res.send('ERROR MESSAGE!')
        console.log(error);
    });
});

router.post('/update-collection', isAdmin, (req, res) => {
    Promise.all([scrape.getCards(), cardController.getAllCards()])
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
                    cardController.updateCard(newCards[i]);
                }
                oldCards.splice(index, 1); // Remove the card from the array to increase speed

            } else if (index === -1) { // If the index is not found, then add card to db
                newProduct.push(newCards[i]);
                cardController.createCard(newCards[i]);
            }
        }
        res.status(200);
        res.render('cards.html', {
            cards: newProduct
        });
    }).catch((error) => {
        res.status(500);
        res.send('ERROR MESSAGE!')
        console.log(error);
    });
});

router.get('/search', (req, res) => {
    cardController.getCardByTitle(req.query.title)
    .then((card) => {
        console.log('searched card sent');
        console.log(card);
        res.status(200);
        res.send(card);
    }).catch((error) => {
        res.status(500);
        res.send(error.stack)
        console.log(error);
    });
});

router.post('/update-card', isAdmin, (req, res) => {
    console.log(req.query);
    cardController.updateCard(req.query)
    .then((card) => {
        res.status(200);
        res.send(card);
    }).catch((error) => {
        res.status(500);
        res.send(error.stack)
        console.log(error);
    });
});

router.post('/seed', isAdmin, (req, res) => {
    scrape.getCards().then((cards) => {
        //TODO: This needs to be a function that is wrapped in a promise
        cards.forEach((card) => {
            cardController.createCard(card);
        });
    }).then(() => {
        res.status(200);
        res.send('Scrape & Seed Completed');
    }).catch((err) => {
        res.status(500);
        res.send('ERROR MESSAGE!')
        console.log(err);
    });
});

router.post('/wishlist', isAuthenticated, (req, res) => {
    userCardController.addCardToWishlist(req.user.user_id, req.body.card_id)
    .then((createdUserCard) => {
        res.status(200);
        res.send(createdUserCard);
    }).catch((error) => {
        res.status(500);
        res.send('WISHLIST CARD NOT CREATED');
        console.log(error);
    });
});

router.get('/wishlist', isAuthenticated, (req, res) => {
    userCardController.getWishlist(req.user.user_id)
    .then((data) => {
        let cards = data.map(el => el.card);
        res.status(200);
        res.send(cards);
    }).catch((error) => {
        res.status(500);
        res.send('COULD NOT GET WISHLIST');
        console.log(error);
    });
});

router.delete('/wishlist', isAuthenticated, (req, res) => {
    userCardController.deleteCardFromWishlist(req.user.user_id, req.body.card_id)
    .then((affectedRows) => {
        if (affectedRows > 0) {
            res.sendStatus(204);
        } else {
            res.sendStatus(400); // If no rows were affected, it was a bad request
        }
    }).catch((error) => {
        res.status(500);
        res.send('COULD NOT DELETE WISHLIST');
        console.log(error);
    });
});

module.exports = router;