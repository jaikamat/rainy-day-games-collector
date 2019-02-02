const Sequelize = require('sequelize')
const sequelize = require('../initializedb');

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
    }
});

User.sequelize.sync()
.then(() => {
    console.log('Users table synced');
}).catch((error) => {
    console.log('There was an error syncing the Users table')
});

module.exports = User;