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

    router.post('/signup', (req, res, next) => {
        // Passport custom callback - review http://www.passportjs.org/docs/authenticate/
        passport.authenticate('signup-local', (error, user, info) => {
            if (error) { return next(error) }
            if (!user) { return res.send(info.message) } // Grabs the message from the done() invocation
            req.login(user, (error) => { // Must call this to establish a session with the new user
                if (error) { return next(error) }
                res.redirect('/cards');
            });
        })(req, res, next);
    });
    
    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
    });
    
    return router;
};