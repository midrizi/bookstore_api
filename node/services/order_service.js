const paypal = require('paypal-rest-sdk');
const db = require('../models');
const { clientId, clientSecret, mode, returnUrl, cancelUrl } = require('../_helpers/config')['paypal'];

const { Order, OrderItems, Currency, ProductDetails, Product, ProductImages, sequelize, Sequelize } = db;

paypal.configure({
    'mode': mode, //sandbox or live
    'client_id': clientId,
    'client_secret': clientSecret
});

module.exports = {
    getProductsFromSingleOrder,
    insertItemInShoppingCart,
    updateQuantityInShoppingCart,
    deleteItemFromShoppingCart,
    checkout,
    pay
};

/**
 *  @param {number} userId Current logged in user
 *  @param {object} productParam Received body
 *  @param {string} status Order status
 * */
async function getProductsFromSingleOrder(userId, productParam, status = 'pending') {
    let { currency } = productParam; // getting currency from body

    // checking if the currency provided by the user exists in our table
    // before we query and send out our data back
    let checkCurrencyExists = (currency)
        ? await Currency.findOne({ where: { currencyCode: currency }, raw: true })
        : null;

    // If the currency provided by user is not satisfied
    // USD will be used by default
    currency = checkCurrencyExists ? currency : 'usd';

    // executing query to get all products from a single order
    // including product details and image
    const result = await Order.findAll({
        include: {
            model: OrderItems, attributes: [], required: true,
            include: {
                model: Product, attributes: [], required: true,
                include: [{ // join Product Details on Product
                    model: ProductDetails, as: 'details', attributes: [], required: true,
                    include: { // join Currency on Product Details
                        model: Currency, as: 'cur', attributes: [], on: { currencyCode: currency }
                    }
                }, { model: ProductImages, attributes: [] }]
            }
        },
        attributes: [
            'OrderItem.Product.id',
            'OrderItem.Product.name',
            [sequelize.col('OrderItem.Product.ProductImage.url'), 'image'],
            'OrderItem.quantity',
            // trimming price to two decimal points
            [sequelize.literal(
                'TRUNCATE(' +
                '`OrderItem->Product->details`.`price` * `OrderItem->Product->details->cur`.`currencyRate`, 2)'
            ), 'price'],
        ], where: { userId, status }, raw: true
    });

    if (!result.length) throw 'No items were found';

    // getting the total amount of the order
    const total = await Order.findOne({
        include: { model: Currency, attributes: [], as: 'cur', on: { currencyCode: currency } },
        where: { status },
        attributes: [
            [sequelize.literal('TRUNCATE(`Order`.`total` * `cur`.`currencyRate`, 2)'), 'total']
        ],
        raw: true
    });

    return { result, currency, ...total }
}

/**
 *  @param {number} userId Current logged in user
 *  @param {number} productId Id of product
 *  @param {object} productParam Parameters to be inserted
 * */
async function insertItemInShoppingCart(userId, productId, productParam) {
    const t = await sequelize.transaction();

    try {
        // getting price of the product
        const product = await Product.findOne({
            include: { model: ProductDetails, as: 'details', attributes: [] },
            where: { id: productId },
            attributes: ['details.price', 'details.quantity'],
            raw: true,
            transaction: t
        });

        if (!product) throw 'Product not found';

        // checking if shopping cart exists, otherwise create one
        let order =
            await Order.findOne({ where: { userId, status: 'pending' }, transaction: t }) ||
            await Order.create({ userId, status: 'pending' }, { transaction: t });

        // assigning orderId and productId to { productParam }
        Object.assign(productParam, { orderId: order.id }, { productId });

        const itemInShoppingCart = await OrderItems.findOne({
            where: { orderId: productParam.orderId, productId: productId },
            transaction: t
        });

        if (itemInShoppingCart) throw 'Product already in the cart';

        const { quantity } = product;

        // set the maximum quantity that we have in stock
        // in case the value is greater than the one coming from user
        productParam.quantity = await (productParam.quantity > quantity) ? quantity : productParam.quantity;

        // inserting item into shopping cart
        await OrderItems.create(productParam, { fields: ['productId', 'orderId', 'quantity'], transaction: t });

        // update total after insertion
        await updateTotal(userId, t);

        await t.commit();
    } catch (error) {
        // if the execution reaches this line, an error occurred.
        await t.rollback();
        throw error;
    }
}

/**
 *  @param {number} userId Current logged in user
 *  @param {number} productId Id of product
 *  @param {object} productParam Parameters to be updated
 * */
async function updateQuantityInShoppingCart(userId, productId, productParam) {
    const t = await sequelize.transaction();

    try {
        // getting price and quantity of product
        const order = await Order.findOne({
            include: {
                model: OrderItems, attributes: [], where: { productId },
                include: {
                    model: Product, attributes: [], required: true,
                    include: { model: ProductDetails, as: 'details', attributes: [] }
                },
            },
            where: { userId, status: 'pending' },
            attributes: ['id', 'OrderItem.Product.details.quantity'],
            raw: true,
            transaction: t
        });

        if (!order) throw 'Product not found in cart';

        // setting orderId from the query above
        // and quantity of the available stock
        const { quantity, id: orderId } = order;

        // setting max value of the quantity in stock
        productParam.quantity = await (productParam.quantity > quantity) ? quantity : productParam.quantity;

        // update quantity of product in shopping cart
        await OrderItems.update(productParam, {
            where: { productId, orderId },
            fields: ['quantity'],
            transaction: t
        });

        // updating total
        await updateTotal(userId, t);

        // commit transaction
        await t.commit();
    } catch (error) {
        // if execution reaches this line, an error occurred.
        await t.rollback();
        throw error;
    }
}


/**
 *  @param {number} userId Current logged in user
 *  @param {number} productId Id of product
 * */
async function deleteItemFromShoppingCart(userId, productId) {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findOne({ where: { userId, status: 'pending' }, transaction: t });

        if (!order) throw 'Cannot delete non existing cart';

        // getting price of the product and the quantity
        const item = await OrderItems.findOne({
            include: {
                model: Product, attributes: [],
                include: {
                    model: ProductDetails, as: 'details', attributes: []
                }, where: { id: productId }
            },
            where: { orderId: order.id },
            attributes: ['id', 'quantity', 'Product.details.price'],
            raw: true,
            transaction: t
        });

        if (!item) throw 'Already not in cart';

        // delete item from shopping cart
        await OrderItems.destroy({ where: { productId, orderId: order.id }, transaction: t });

        await updateTotal(userId, t);

        await t.commit();

    } catch (error) {
        // rolling back transaction in case of an error
        // during execution of queries
        await t.rollback();
        throw error;
    }
}

/**
 *  @param {number} userId Current logged in user
 * */
async function checkout(userId) {
    const order = await Order.findOne({
        where: { userId, status: 'pending' },
        attributes: ['total'],
        raw: true
    });

    // checking if order exists before checking out
    if (!order) throw 'Could not find order';

    // getting all items from shopping cart
    const items = await Order.findAll({
        include: {
            model: OrderItems,
            attributes: [],
            include: {
                model: Product, attributes: [],
                include: {
                    model: ProductDetails,
                    as: 'details',
                    attributes: [],
                    include: { model: Currency, as: 'cur', on: { currencyCode: 'usd' }, attributes: [] }
                }
            }
        },
        attributes: [
            'OrderItem.quantity',
            'OrderItem.Product.name',
            'OrderItem.Product.details.price',
            // convert currency uppercase for now we use USD since MKD is not supported
            [sequelize.fn('upper', Sequelize.col('OrderItem.Product.details.cur.currencyCode')), 'currency']
        ],
        where: { userId, status: 'pending' },
        raw: true
    });

    // creating our payment schema for paypal
    const create_payment_json = {
        'intent': 'sale',
        'payer': {
            'payment_method': 'paypal'
        },
        'redirect_urls': {
            'return_url': returnUrl,
            'cancel_url': cancelUrl
        },
        'transactions': [{
            'item_list': {
                'items': []
            },
            'amount': {
                'currency': 'USD',
                'total': order.total
            },
            // 'description': 'This is the payment description.'
        }]
    };

    // pushing items into paypal configuration
    items.forEach(elem => create_payment_json.transactions[0].item_list.items.push(elem));

    return new Promise((resolve, reject) => {
        paypal.payment.create(create_payment_json, (err, payment) => {
            return err ? reject(err) : resolve(payment)
        });
    });
}

/**
 *  @param {number} userId Current logged in user
 *  @param {object} productParam Received body
 * */
async function pay(userId, productParam) {
    const { payerID, paymentID } = productParam;

    if (!payerID || !paymentID) throw 'Invalid payment parameters';

    const order = await Order.findOne({
        include: { model: Currency, attributes: [], as: 'cur', on: { currencyCode: 'usd' } },
        where: { userId, status: 'pending' },
        attributes: [
            'total',
            [sequelize.fn('upper', Sequelize.col('cur.currencyCode')), 'currency']
        ], raw: true
    });

    if (!order) throw 'Could not find order';

    const { total, currency } = order;

    const execute_payment_json = {
        'payer_id': payerID,
        'transactions': [{
            'amount': {
                'currency': currency,
                'total': total
            }
        }]
    };

    //TODO check if there are enough products before paying
    // and then decrees items from the stock
    return new Promise((resolve, reject) => {
        paypal.payment.execute(paymentID, execute_payment_json, (err, payment) => {
            if (err) return reject(err);

            Order.update({ status: 'complete' }, { where: { userId, status: 'pending' } });

            resolve(payment);
        })
    })
}

/**
 *  @param {number} userId Current logged in user
 *  @param {sequelize.transaction} t Query Transaction
 * */
async function updateTotal(userId, t) {
    // finding order and updating (price * quantity) of all items in that order
    const order = await Order.findOne({
        include: {
            model: OrderItems, attributes: [],
            include: {
                model: Product, attributes: [],
                include: { model: ProductDetails, as: 'details', attributes: [] }
            }
        },
        attributes: ['id', [sequelize.literal('SUM(`OrderItem->Product->details`.`price` * `OrderItem`.`quantity`)'), 'tot']],
        where: { status: 'pending', userId },
        group: ['OrderItem.Product.id', 'id'],
        transaction: t
    });

    // updating total of the shopping cart
    await order.update({ total: order.dataValues.tot }, { transaction: t });
}