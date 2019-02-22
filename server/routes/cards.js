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
        res.status(403);
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
        res.status(403);
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

router.get('/paginate/:page', (req, res) => {
    cardController.getCardsPaginated(req.params.page, 10)
    .then((data) => {
        res.status(200);
        res.send(data);
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

router.get('/search/title', (req, res) => {
    cardController.getCardByTitle(req.query.title)
    .then((card) => {
        res.status(200);
        res.send(card);
    }).catch((error) => {
        res.status(500);
        res.send(error.stack)
        console.log(error);
    });
});

router.get('/search/fuzzy', (req, res) => {
    cardController.getCardsBySubstr(req.query.str)
    .then((cards) => {
        res.status(200);
        res.send(cards);
    }).catch((error) => {
        res.status(500);
        res.send(error.stack)
        console.log(error);
    });
});

router.post('/update/:id', isAdmin, (req, res) => {
    console.log('THE PARAM: ' + req.params.id);
    cardController.updateCard(req.params.id, req.body.quantity)
    .then((card) => {
        res.status(200);
        res.send(card);
    }).catch((error) => {
        res.status(500);
        res.send(error.stack)
        console.log(error);
    });
});

// TODO: This function takes a while to execute in sqlite3.
// Write some frontend functionality to show the user progress
router.post('/seed', isAdmin, (req, res) => {
    scrape.getCards().then((cards) => {
        return Promise.all(cards.map(card => cardController.createCard(card)));
    }).then((cards) => {
        res.status(200);
        res.send('Scrape and seed complete!');
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
        res.send(error.message);
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