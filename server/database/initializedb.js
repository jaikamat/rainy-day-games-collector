const Sequelize = require('sequelize');
// const models = require('./models');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    storage: './cardsDatabase.db'
});

sequelize.authenticate()
.then(() => {
    console.log('A connection to the database has been established');
}).catch(() => {
    console.log('Database not found');
});

// models.sequelize.sync()
// .then(() => {
//     console.log('Database models are fine');
// }).catch((error) => {
//     console.log(arror);
// })

module.exports = sequelize;