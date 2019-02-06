const express = require('express');
const router = express.Router();
const userController = require('../database/controllers/user');

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

router.get('/', isAdmin, (req, res) => {
    userController.getUsers()
    .then((users) => {
        res.status(200);
        res.send(users);
    }).catch((error) => {
        res.status(500);
        res.send(error.message);
        console.log(error);
    });
});

router.post('/', isAdmin, (req, res) => {
    userController.updateUser(req.query.userId, req.query.username)
    .then((updatedUser) => {
        res.status(200);
        res.send(updatedUser);
    }).catch((error) => {
        res.status(500);
        res.send(error.message);
        console.log(error.message);
    });
});

router.delete('/', isAdmin, (req, res) => {
    if (parseInt(req.body.userId) === req.user.user_id) {
        throw new Error('You can\'t delete yourself!');
    }
    userController.deleteUser(req.body.userId)
    .then((affectedRows) => {
        if (affectedRows > 0) {
            res.sendStatus(204);            
        } else {
            res.sendStatus(400);
        }
    }).catch((error) => {
        res.status(500);
        res.send(error.message);
        console.log(error);
    });
})

module.exports = router;