module.exports = (sequelize, Sequelize) => {
    const UserCard = sequelize.define('userCard', {
        userCard_id: {
            autoincrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        user_id: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        card_id: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'card',
                key: 'card_id'
            }
        }
    });

    // Create associations
    UserCard.associate = (models) => {
        UserCard.belongsTo(models.user, { foreignKey: 'user_id' });
        UserCard.belongsTo(models.card, { foreignKey: 'card_id' });
    };
    
    return UserCard;
};