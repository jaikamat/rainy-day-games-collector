module.exports = (sequelize, Sequelize) => {
    const UserCard = sequelize.define('userCard', {
        userCard_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        user_id: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
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
        UserCard.belongsTo(models.users, { foreignKey: 'user_id', onDelete: 'cascade' });
        UserCard.belongsTo(models.card, { foreignKey: 'card_id' });
    };
    
    return UserCard;
};