const User = require('../database/models').users;

let passportConfig = {};

passportConfig.signupLocal = (req, username,password, done) => {
    User.findOne({
        where: { username: username }
    }).then((user) => {
        if (user) {
            return done(null, false, {
                message: 'That username is already taken'
            });
        } else {
            const data = {
                username: username,
                password: password
            };
            return User.create(data);
        }
    }).then((createdUser) => {
        if (!createdUser) {
            console.log(createdUser);
            console.log('User was not created');
            return done(null, false);
        }
        if (createdUser) {
            console.log('User was created! Success!');
            return done(null, createdUser)
        }
    }).catch((error) => {
        console.log(error);
    });
};

passportConfig.loginLocal = (req, username, password, done) => {
    User.findOne({
        where: { username: username }
    }).then((user) => {
        if (!user) {
            console.log('User was not found with username ' + username);
            return done(null, false);
        } 
        if (!user.validPassword(password)) {
            console.log('Password was not valid with user ' + user);
            return done(null, false);
        }
        return done(null, user);
    }).catch((error) => {
        console.log(error);
    })
};

passportConfig.serialize = (user, done) => {
    done(null, user.user_id);
};

passportConfig.deserialize = (id, done) => {
    User.findById(id)
    .then((user) => {
        done(null, user);
    }).catch((error) => {
        console.log(error)
    });
};

module.exports = passportConfig;