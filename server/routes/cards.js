const cardController = require("../database/controllers/card");
const userCardController = require("../database/controllers/userCard");
const express = require("express");
const router = express.Router();

/**
 * User auth middleware, req.isAuthenticated is added by passportjs
 */
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(403);
        res.send("THIS ROUTE IS FORBIDDEN");
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
        res.send("THIS ROUTE IS FORBIDDEN - NO ADMIN");
    }
};

// Remember: The GET url to access this is '/cards'
router.get("/", (req, res) => {
    cardController
        .getAllCards()
        .then(cards => {
            res.status(200);
            res.send(cards);
        })
        .catch(error => {
            res.status(500);
            res.send("ERROR MESSAGE!");
            console.log(error);
        });
});

router.get("/paginate/:page", (req, res) => {
    cardController
        .getCardsPaginated(req.params.page, 10)
        .then(data => {
            res.status(200);
            res.send(data);
        })
        .catch(error => {
            res.status(500);
            res.send("ERROR MESSAGE!");
            console.log(error);
        });
});

router.get("/search/dynamic", (req, res) => {
    const bod = req.body;
    let searchParams = {};

    if (bod.title) searchParams.title = bod.title;
    if (bod.scryfall_id) searchParams.scryfall_id = bod.scryfall_id;
    if (bod.card_id) searchParams.card_id = bod.card_id;
    if (bod.setCode) searchParams.setCode = bod.setCode;
    if (bod.lowPrice) searchParams.lowPrice = bod.lowPrice;
    if (bod.highPrice) searchParams.highPrice = bod.highPrice;

    cardController
        .getCardsDynamic(searchParams)
        .then(cards => {
            res.status(200);
            res.send(cards);
        })
        .catch(error => {
            res.status(500);
            res.send(error.stack);
            console.log(error);
        });
});

router.get("/search/fuzzy", (req, res) => {
    cardController
        .getCardsBySubstr(req.query.title)
        .then(cards => {
            res.status(200);
            res.send(cards);
        })
        .catch(error => {
            res.status(500);
            res.send(error.stack);
            console.log(error);
        });
});

router.post("/update/:id", isAdmin, (req, res) => {
    cardController
        .updateCard(req.params.id, req.body)
        .then(card => {
            res.status(200);
            res.send(card);
        })
        .catch(error => {
            res.status(500);
            res.send(error.stack);
            console.log(error);
        });
});

router.post("/rdg/update", isAdmin, (req, res) => {
    return cardController
        .updateCardsFromRDG(req.query.setCode)
        .then(updatedRows => {
            res.status(200);
            res.send(updatedRows);
        })
        .catch(error => {
            res.status(500);
            res.send(error.stack);
            console.log(error);
        });
});

router.post("/wishlist", isAuthenticated, (req, res) => {
    userCardController
        .addCardToWishlist(req.user.user_id, req.body.card_id)
        .then(createdUserCard => {
            res.status(200);
            res.send(createdUserCard);
        })
        .catch(error => {
            res.status(500);
            res.send(error.message);
            console.log(error);
        });
});

router.get("/wishlist", isAuthenticated, (req, res) => {
    userCardController
        .getWishlist(req.user.user_id)
        .then(data => {
            let cards = data.map(el => el.card);
            res.status(200);
            res.send(cards);
        })
        .catch(error => {
            res.status(500);
            res.send("COULD NOT GET WISHLIST");
            console.log(error);
        });
});

router.delete("/wishlist", isAuthenticated, (req, res) => {
    userCardController
        .deleteCardFromWishlist(req.user.user_id, req.body.card_id)
        .then(affectedRows => {
            if (affectedRows > 0) {
                res.sendStatus(204);
            } else {
                res.sendStatus(400); // If no rows were affected, it was a bad request
            }
        })
        .catch(error => {
            res.status(500);
            res.send("COULD NOT DELETE WISHLIST");
            console.log(error);
        });
});

module.exports = router;
