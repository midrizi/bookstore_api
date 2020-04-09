const db = require('../models');
const { User, Auth, Address, sequelize } = db;

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};


async function getAllUsers() {
    return User.findAll({ attributes: { exclude: ['password'] } });
}

/**
 *  @param {number} id User Id
 * */
async function getUserById(id) {
    const user = await User.findOne({
        include: { model: Address, attributes: [] },
        attributes: [
            'email',
            'firstName',
            'lastName',
            'Address.street',
            'Address.state',
            'Address.city',
            'Address.country',
            'Address.zip',
        ], raw: true,
        where: { id }
    });

    if (!user) throw 'User not found';

    return user;
}

/**
 *  @param {object} userParam Parameters to create a new user
 * */
async function createUser(userParam) {
    // check if email is taken
    if (await User.findOne({ where: { email: userParam.email || null } }))
        throw `Email ${userParam.email} is already taken`;

    try {
        const result = await sequelize.transaction(async (t) => {

            // transaction of user
            const usr = await User.create(userParam, {
                transaction: t,
                fields: ['email', 'firstName', 'lastName', 'password']
            });

            // setting userId of the inserted product
            userParam.userId = usr.id;

            // transaction address of user
            await Address.create(userParam, {
                transaction: t,
                fields: ['street', 'city', 'state', 'country', 'zip', 'userId']
            });
        });
    } catch (error) {
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw error;
    }
}

/**
 *  @param {number} id User Id
 *  @param {object} userParam Parameters to update user
 * */
async function updateUser(id, userParam) {
    const user = await User.findOne({ where: { id }, raw: true });

    // trying to update a non existing user
    if (!user) throw 'User not found';

    if (user.email !== userParam.email && await User.findOne({ where: { email: userParam.email || null } }))
        throw `Email ${userParam.email} is already taken`;

    try {
        const result = await sequelize.transaction(async (t) => {

            // transaction update for product
            const { email, firstName, lastName, password } = userParam;

            // checking weather there are provided parameters before executing the query
            if (email || firstName || lastName || password) {
                await User.update({
                    ...userParam
                }, {
                    where: { id },
                    transaction: t,
                    fields: ['email', 'firstName', 'lastName', 'password']
                });
            }

            // transaction update for user address
            const { address, street, state, country, zip } = userParam;

            // checking weather there are provided parameters before executing the query
            if (address || street || state || country || zip) {
                await Address.update({
                    ...userParam
                }, {
                    where: { userId: id },
                    transaction: t,
                    fields: ['street', 'city', 'state', 'country', 'zip']
                });
            }
        });
    } catch (error) {
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw error;
    }
}

/**
 *  @param {number} id User Id
 * */
async function deleteUser(id ) {
    return User.destroy({ where: { id } });
}