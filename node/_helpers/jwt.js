const expressJwt = require('express-jwt');
const config = require('../_helpers/config');
const db = require('../models');
const { User } = db;

module.exports = jwt;

function jwt() {
    const secret = config['secret'];
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            { url: '/user/authenticate', methods: ['POST'] },
            { url: '/user/register', methods: ['POST'] },
            { url: /^\/products\/.*/, methods: ['GET'] }
        ]
    });
}

const isRevoked = async (req, payload, done) => {
    const user = await User.findOne({ where: { id: payload.sub || null } });

    if (!user)
        return done(null, true);

    done()
};