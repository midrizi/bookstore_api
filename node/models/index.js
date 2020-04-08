const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const config = require('../_helpers/config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config['mysqlDB']);

const db = {};

// importing all the models into the db object
fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== basename);
    })
    .forEach(function (file) {
        let model = sequelize["import"](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

const { Address, Auth, Currency, Order, OrderItems, Product, Category, ProductDetails, ProductImages, User, Vat } = db;

/*
*  User
* */

    // user authorization
    User.hasOne(Auth, { foreignKey: 'userId', onDelete: 'cascade' });
    Auth.belongsTo(User, { foreignKey: 'userId' });

    // connection with user and address
    User.hasOne(Address, { foreignKey: 'userId' });
    Address.belongsTo(User, { foreignKey: 'userId' });

    // user and orders
    User.hasOne(Order, { foreignKey: 'userId' });
    Order.belongsTo(User, { foreignKey: 'userId' });

/*
*  Product
* */

    // product and product_details
    Product.hasOne(ProductDetails, { foreignKey: 'productId', as: 'details', onDelete: 'cascade' });
    ProductDetails.belongsTo(Product, { foreignKey: 'productId' });

    // product photo (limited to one for now)
    Product.hasOne(ProductImages, { foreignKey: 'productId', onDelete: 'cascade' });
    ProductImages.belongsTo(Product, { foreignKey: 'productId' });

    // product and ordered items
    Product.hasOne(OrderItems, { foreignKey: 'productId' });
    OrderItems.belongsTo(Product, { foreignKey: 'productId' });

    // product and Category
    Product.hasOne(Category, { foreignKey: 'productId' });
    Category.belongsTo(Product, { foreignKey: 'productId' });

/*
* Price
* */

    // price has value added tax (vat)
    Vat.hasOne(ProductDetails, { foreignKey: 'vatId' });
    ProductDetails.belongsTo(Vat, { foreignKey: 'vatId' });

    // price and currencies
    ProductDetails.hasOne(Currency, { constraints: false, as: 'cur' });
    Currency.belongsTo(ProductDetails, { constraints: false });

    // currency and order
    Order.hasOne(Currency, { constraints: false, as: 'cur' });
    Currency.belongsTo(Order, { constraints: false });

/*
* Cart and Orders
* */

    // ordered items and orders
    Order.hasOne(OrderItems, { foreignKey: 'orderId' });
    OrderItems.belongsTo(Order, { foreignKey: 'orderId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
