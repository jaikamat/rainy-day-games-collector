const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config")[env];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        dialect: config.dialect,
        pool: {
            max: 30,
            min: 0,
            idle: 20000,
            acquire: 20000 // Increase this to handle large initial seeding of ~50000 rows
        },
        define: {
            freezeTableName: true // This prevents pluralization confusion on model references and in sqlite CLI
        },
        logging: false // Flag that determines if SQL operations are displayed on console
    }
);

// Create db object for easy export
let db = {};

// Iterate through model files and add them to the db object
fs.readdirSync(__dirname)
    .filter(file => {
        return file.indexOf(".") !== 0 && file !== "index.js";
    })
    .forEach(file => {
        let model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

// Create table associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
