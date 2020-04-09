let config = {
    production: {
        mysqlDB: 'mysql://root:root@book_db/books',
        secret: 'THIS IS VERY SECRET',

        server: {
            host: 'localhost',
            port: 80
        }
    },

    development: {
        paypal: {
            mode: 'sandbox',
            clientId: '<CLIENT KEY>',
            clientSecret: '<CLIENT SECRET>',
        },

        mysqlDB: 'mysql://root:root@book_db/books',
        secret: 'THIS IS VERY SECRET',

        server: {
            host: 'localhost',
            port: 80
        }
    }
};

// checking environment
let env = (process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'development')
    ? 'development'
    : 'production';

module.exports = config[env];