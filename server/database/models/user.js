const bCrypt = require('bcrypt-nodejs');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('user', {
        user_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        username: {
            type: Sequelize.TEXT
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastLogin: {
            type: Sequelize.DATE
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        isAdmin: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        hooks: {
            beforeCreate: (user) => {
                const salt = bCrypt.genSaltSync();
                user.password = bCrypt.hashSync(user.password, salt);
            }
        }
    });

    // Create associations
    User.associate = (models) => {
        User.belongsToMany(models.card, { through: models.userCard });
    };

    // Cannot use an arrow function here due to `this` binding errors on model instance
    User.prototype.validPassword = function(password) {
        return bCrypt.compareSync(password, this.password);
    };

    return User;
};