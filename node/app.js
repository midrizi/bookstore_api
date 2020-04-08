const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/error-handling');

const app = express();

const jwt = require('./_helpers/jwt');

// access logging
const accessLogStream = require('./middleware/access');
app.use(logger('combined', { stream: accessLogStream }));
// server error logging
const errorLogStream = require('./middleware/error');
app.use(logger('combined'), { stream: errorLogStream });

app.use(logger('dev'));

// EXECUTE THE LINE BELOW TO CREATE ALL TABLES
// AND ALSO INSERT SOME DUMMY DATA
// const dumpData = require('./middleware/dumpDatabase');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// parse request as JSON
app.use(bodyParser.json({ type: true }));
app.use(cookieParser());

// using jwt and checking for permissions
app.use(jwt());

// all routes must go here
app.use('/user', require('./controllers/user_controller'));
app.use('/products', require('./controllers/product_controller'));
app.use('/cart', require('./controllers/cart_controller'));
app.use('/order', require('./controllers/order_controller'));

// catch 404 and forward to error handle
app.use((req, res, next) => {
    next('Not Found');
});

// handling all the errors occurred in the server
app.use(errorHandler);

module.exports = app;
