const express = require('express');
const router = express.Router();

module.exports = (passport) => {
    router.get('/login', (req, res) => {
        res.send('LOGIN PAGE HERE');
    });
    
    router.post('/login', passport.authenticate('login-local', {
        successRedirect: '/cards',
        failureRedirect: '/login'
    }));
    
    router.get('/signup', (req, res) => {
        res.send('SIGNUP PAGE HERE');
    });
    
    router.post('/signup', passport.authenticate('signup-local', {
        successRedirect: '/cards',
        failureRedirect: '/login'
    }));
    
    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
    });
    
    return router;
};