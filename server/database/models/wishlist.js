module.exports = (sequelize, Sequelize) => {
    const Wishlist = sequelize.define('wishlist', {
        id: {
            autoincrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        }
    })
    
    return Wishlist;
};