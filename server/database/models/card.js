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
        },
        cardInventory_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'cardInventory',
                key: 'cardInventory_id'
            }
        }
    }, {
        hooks: {
            // After a card entry is created, create
            // a cardInventory 1:1 association entry to record price and quantity in the future
            afterCreate: (card) => {
                sequelize.models.cardInventory.create()
                .then(cardInventory => {
                    return sequelize.models.card.update(
                        { cardInventory_id: cardInventory.dataValues.cardInventory_id }, // Tie the foreignKey on card to the key of cardInventory
                        { where: { card_id: card.dataValues.card_id } } // Where this is the current card created
                    )
                }).then(numRows => {
                    if (numRows > 1 || numRows === 0) {
                        throw new Error('Only 1 row must be updated')
                    };
                }).catch(error => {
                    console.log(error);
                });
            }
        }
    });

    // Create associations
    Card.associate = (models) => {
        Card.belongsToMany(models.user, { through: models.userCard });
        Card.belongsTo(models.cardInventory, { foreignKey: 'cardInventory_id' });
    };

    return Card
};