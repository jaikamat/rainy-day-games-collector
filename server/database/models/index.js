const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
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

// Create db object for easy export
let db = {};

// Iterate through model files and add them to the db object
fs.readdirSync(__dirname)
.filter((file) => {
    return (file.indexOf('.')!== 0) && (file !== 'index.js');
})
.forEach((file) => {
    let model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
});

// Create table associations
db.user.hasOne(db.wishlist);
db.wishlist.belongsTo(db.user);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;