const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    getCardsFromRDG().then((cards) => {
        res.render('cards.html', {
            cards: cards
        })
    }).catch((err) => {
        console.log(err);
    });
})

router.get('/new-product', (req, res) => {
    // list comparison here
    res.send('route 2 is active');
})

module.exports = router;