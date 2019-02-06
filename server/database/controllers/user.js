const User = require('../models').user;

/**
 * Returns all users in the database
 */
async function getUsers() {
    return await User.findAll();
}

/**
 * Updates an existing user with a new username
 * @param {Integer} userId 
 * @param {String} username 
 */
async function updateUser(userId, username) {
    if (!username) {
        throw new Error('Username is required to update a user');
    }
    
    return await User.update({
        username: username
    }, {
        where: {
            user_id: userId
        }
    }).then((affectedRows) => {
        if (affectedRows[0] === 0) {
            throw new Error('User was not updated')
        } else {
            return User.findOne({
                where: {
                    user_id: userId
                }
            });
        }
    });
}

/**
 * Deletes an existing user from the database
 * @param {Integer} userId 
 */
async function deleteUser(userId) {
    return await User.destroy({
        where: {
            user_id: userId
        }
    });
}

module.exports.getUsers = getUsers;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;