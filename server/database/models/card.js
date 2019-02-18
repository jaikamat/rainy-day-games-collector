module.exports = (sequelize, Sequelize) => {
    const Card = sequelize.define('card', {
        card_id: {
            autoincrement: true,
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
            allowNull: false
        },
        colors: {
            type: Sequelize.STRING, // Note: joined from source array into single string
            allowNull: false
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
        }
    }, {
        hooks: {
            // After a card entry is created, create
            // a cardInventory 1:1 association entry to record price and quantity later
            afterCreate: (card) => {
                sequelize.models.card.findOne({
                    where: {
                        scryfall_id: card.dataValues.scryfall_id
                    }
                }).then(card => {
                    return sequelize.models.cardInventory.create({
                        card_id: card.card_id,
                        price: 0,
                        quantity: 0
                    })
                }).catch(error => {
                    console.log(error);
                });
            }
        }
    });

    // Create associations
    Card.associate = (models) => {
        Card.belongsToMany(models.user, { through: models.userCard });
        // Card.hasOne(models.cardInventory, { foreignKey: 'cardInventory_id' });
    };

    return Card
};