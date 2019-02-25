module.exports = (sequelize, Sequelize) => {
    const Card = sequelize.define('card', {
        card_id: {
            autoIncrement: true, // NOTE: This must be camelcase or it fails silently when attempting to return model instance id's in hooks
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        scryfall_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        scryfall_uri: {
            type: Sequelize.STRING,
            allowNull: false
        },
        image_uri: {
            type: Sequelize.STRING,
            allowNull: true
        },
        colors: {
            type: Sequelize.STRING, // Note: joined from source array into single string
            allowNull: true
        },
        reserved: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        setCode: {
            type: Sequelize.STRING,
            allowNull: false
        },
        rarity: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
            type: Sequelize.DECIMAL,
            defaultValue: 0
        },
        quantity: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        isFoil: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    });

    // Create associations
    Card.associate = (models) => {
        Card.belongsToMany(models.users, { through: models.userCard });
    };

    return Card
};