const express = require('express');
const router = express.Router();

router.get('/signup', (req, res) => {
    res.send('SENDING SIGN-UP ROUTE');
});

router.get('/signin', (req, res) => {
    res.send('SENDING SIGN-IN ROUTE');
});

module.exports = router;