module.exports = (sequelize, Sequelize) => {
    const CardInventory = sequelize.define('cardInventory', {
        cardInventory_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        price: {
            type: Sequelize.DECIMAL,
            defaultValue: 0
        },
        quantity: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });

    return CardInventory;
};