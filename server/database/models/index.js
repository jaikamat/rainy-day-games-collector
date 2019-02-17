const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sqlConfig = require('../config');
const env = process.env.NODE_ENV || 'dev';

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    storage: sqlConfig[env].storage,
    define: {
        freezeTableName: true // This prevents pluralization confusion on model references and in sqlite CLI
    }
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
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;