const db = require('../models');
const { Product, Category, ProductImages, ProductDetails, Currency, sequelize, Sequelize } = db;
const { Op } = Sequelize;

module.exports = {
    getAllProducts,
    getProductById,
    findByCategory,
    findByQuery,
    createProduct,
    updateProduct,
    deleteProduct
};

/**
 *  @param {object} productParam Optional parameters like currency
 * */
async function getAllProducts(productParam) {
    const currency = await getCurrency(productParam);

    // joining currency and details into product
    const result = await Product.findAll({
        include: [{
            model: ProductDetails, as: 'details',
            attributes: [],
            include: { // join currency on product details
                model: Currency, as: 'cur',
                attributes: [],
                on: { currencyCode: currency }
            },
        }, {
            model: ProductImages, attributes: []
        }], attributes: [ // selected attributes
            'id',
            'name',
            'description',
            'details.quantity',
            [sequelize.col('ProductImage.url'), 'image'],
            [sequelize.literal('TRUNCATE(`details`.`price` * `details->cur`.`currencyRate`, 2)'), 'price']
        ], group: ['id', 'details.quantity', 'ProductImage.url', 'details.price'], raw: true
    });

    if (!result) throw 'Products are currently not available';

    return { result, currency };
}

/**
 *  @param {number} id Id of product
 *  @param {object} productParam Received body
 * */
async function getProductById(id, productParam) {
    const currency = await getCurrency(productParam);

    const result = await Product.findOne({
        include: [{
            model: ProductDetails, as: 'details', attributes: [],
            include: {
                model: Currency, as: 'cur', attributes: [],
                on: { currencyCode: currency }
            }
        }, {
            model: ProductImages, attributes: []
        }, {
            model: Category, attributes: []
        }], attributes: [
            'id',
            'name',
            'description',
            'details.quantity',
            [sequelize.col('Category.name'), 'category'],
            [sequelize.col('ProductImage.url'), 'image'],
            [sequelize.literal('TRUNCATE(`details`.`price` * `details->cur`.`currencyRate`, 2)'), 'price']
        ], where: { id }, raw: true
    });

    if (!result) throw 'Product currently not available';

    return { result, currency }
}

/**
 *  @param {string} category Category to be searched
 *  @param {object} productParam Optional parameters like currency
 * */
async function findByCategory(category, productParam) {
    const currency = await getCurrency(productParam);

    // returning all products that are in that category
    const result = await Product.findAll({
        include: [{
            model: ProductDetails, as: 'details',
            attributes: [],
            include: { // join currency on product details
                model: Currency, as: 'cur',
                attributes: [],
                on: { currencyCode: currency }
            },
        }, {
            model: ProductImages, attributes: []
        }, {
            model: Category, attributes: [], where: { name: category }, required: true
        }], attributes: [ // selected attributes
            'id',
            'name',
            'description',
            'details.quantity',
            [sequelize.col('Category.name'), 'category'],
            [sequelize.col('ProductImage.url'), 'image'],
            [sequelize.literal('TRUNCATE(`details`.`price` * `details->cur`.`currencyRate`, 2)'), 'price']
        ], group: ['id', 'details.quantity', 'ProductImage.url', 'details.price'], raw: true
    });

    if (!result) throw 'Products are currently not available';

    return { result, currency };
}


/**
 *  @param {string} query Category to be searched
 *  @param {object} productParam Optional parameters like currency
 * */
async function findByQuery(query, productParam) {
    const currency = await getCurrency(productParam);

    // returning all the products that match specified query with LIKE '%<query>%'
    const result = await Product.findAll({
        include: [{
            model: ProductDetails, as: 'details',
            attributes: [],
            include: { // join currency on product details
                model: Currency, as: 'cur',
                attributes: [],
                on: { currencyCode: currency }
            },
        }, {
            model: ProductImages, attributes: []
        }],
        attributes: [ // selected attributes
            'id',
            'name',
            'description',
            'details.quantity',
            [sequelize.col('ProductImage.url'), 'image'],
            [sequelize.literal('TRUNCATE(`details`.`price` * `details->cur`.`currencyRate`, 2)'), 'price']
        ],
        group: ['id', 'details.quantity', 'ProductImage.url', 'details.price'],
        where: { name: { [Op.like]: `%${query}%` } },
        raw: true
    });

    if (!result) throw 'Products are currently not available';

    return { result, currency };
}

/**
 *  @param {object} productParam All product related parameters
 * */
async function createProduct(productParam) {
    try {
        await sequelize.transaction(async (t) => {
            // transaction for product
            const pr = await Product.create(productParam, { fields: ['name', 'description'], transaction: t });

            // setting productId of the inserted product
            Object.assign(productParam, { productId: pr.id });

            // transaction for details of product
            await ProductDetails.create(productParam, {
                transaction: t,
                fields: ['price', 'quantity', 'productId']
            });

            // transaction for image of product
            await ProductImages.create(productParam, { fields: ['url', 'productId'], transaction: t });

            await Category.create({ name: productParam.category, ...productParam }, { fields: ['name', 'productId'], transaction: t })
        });
    } catch (error) {
        // if the execution reaches this line, an error occurred.
        // the transaction has already been rolled back automatically by Sequelize!
        throw error;
    }
}

/**
 *  @param {number} id Id of product
 *  @param {object} productParam All product related parameters
 * */
async function updateProduct(id, productParam) {
    const product = await Product.findOne({ where: { id } });

    // trying to update a non existing user
    if (!product) throw 'Product not found';

    try {
        await sequelize.transaction(async (t) => {
            // transaction update for product
            const { name, description, price, quantity, url, category } = productParam;

            // checking weather there are provided parameters before executing the query
            if (name || description) {
                await Product.update({
                    ...productParam,
                }, {
                    where: { id },
                    fields: ['name', 'description'],
                    transaction: t
                });
            }

            // checking weather there are provided parameters before executing the query
            if (price || quantity) {
                await ProductDetails.update({
                    ...productParam,
                }, {
                    where: { productId: id },
                    fields: ['price', 'quantity'],
                    transaction: t
                });
            }

            // checking weather there are provided parameters before executing the query
            if (url) {
                await ProductImages.update({
                    ...productParam,
                }, {
                    where: { productId: id },
                    fields: ['url'],
                    transaction: t
                });
            }

            if (category) {
                await Category.update({
                    name: category,
                }, {
                    where: { productId: id },
                    fields: ['name'],
                    transaction: t
                })
            }

        });
    } catch (error) {
        // if the execution reaches this line, an error occurred.
        // the transaction has already been rolled back automatically by Sequelize!
        throw error;
    }
}

/**
 *  @param {number} id Id of product
 * */
async function deleteProduct(id) {
    return Product.destroy({ where: { id } });
}

async function getCurrency(productParam) {
     let { currency } = productParam; // getting currency form body

     // checking if the currency provided by the user exists in our table
     // before we query and send out our data back
     let checkCurrencyExists = (currency)
         ? await Currency.findOne({ where: { currencyCode: currency }, raw: true })
         : null;

     // if the currency provided by user is not found usd will be used by default
     currency = (checkCurrencyExists) ? currency : 'usd';

     return currency;
}
