module.exports = errorHandler;

const { Sequelize } = require('../models');
const logger = require('../middleware/error');

function errorHandler(err, req, res, next) {
    // console.log(err);
    if (typeof (err) === 'string') {
        // custom application error
        return res.status(404).json({ message: err });
    }

    /*
    *  SEQUELIZE AND PAYPAL VALIDATOR ERROR HANDLER
    * */
    if (err.name === 'SequelizeValidationError' || err.response && err.response.name === 'VALIDATION_ERROR') {
        // if multiple items are not verified returning only one of them
        try {
            // paypal error response
            if (err.response)
                return res.status(err.response.httpStatusCode).json({ message: err.response.message });

            for (let field in err.errors)
                if (err.errors.hasOwnProperty(field))
                    return res.status(400).json({ message: err.errors[field].message });
        } catch (e) {
            next(e);
        }
    }

    // mysql foreign key mismatch
    if (err instanceof Sequelize.ForeignKeyConstraintError)
        return res.status(400).json({ message: 'Failed to Add' });

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ message: 'Invalid Token' });
    }

    // logging {500} server errors to the error file
    logger.error(err);
    // default to 500 server error
    return res.status(500).json({ message: 'This error has been reported.' });
}
