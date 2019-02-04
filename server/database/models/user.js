const Sequelize = require('sequelize')
const sequelize = require('../initializedb');
const bCrypt = require('bcrypt-nodejs');

const User = sequelize.define('user', {
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    username: {
        type: Sequelize.TEXT
    },
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastLogin: {
        type: Sequelize.DATE
    },
    status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
}, {
    hooks: {
        beforeCreate: (user) => {
            const salt = bCrypt.genSaltSync();
            user.password = bCrypt.hashSync(user.password, salt);
        }
    }
});

// Cannot use an arrow function here due to `this` binding errors on model instance
User.prototype.validPassword = function(password) {
    return bCrypt.compareSync(password, this.password);
};

User.sequelize.sync({ force: true })
.then(() => {
    User.create({
        username: 'Jai',
        password: 'testing123',
        isAdmin: true
    });
    User.create({
        username: 'Julie',
        password: 'testing123',
        isAdmin: false
    });
    console.log('Users table synced');
}).catch((error) => {
    console.log('There was an error syncing the Users table')
});

module.exports = User;