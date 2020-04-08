const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../_helpers/config');

const db = require('../models');
const { User, Auth } = db;

module.exports = authenticate;

// This function authenticates user each page they visit
// in case the page is restricted to the public
async function authenticate({ email, password }) {
    if (email === undefined && password === undefined)
        return false;

    // getting user and their access
    const user = await User.findOne({
        include: { model: Auth, attributes: [] },
        where: { email },
        attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'Auth.permissions'],
        raw: true
    });

    if (user && bcrypt.compareSync(password, user.password)) {
        // removing password from returned query
        const { id, password, permissions, ...userWithoutPassword } = user;

        // signing token
        const token = jwt.sign({ sub: id, permissions }, config['secret']);
        return {
            ...userWithoutPassword,
            token
        };
    }
}