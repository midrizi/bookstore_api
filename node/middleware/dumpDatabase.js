const db = require('../models');

(async () => {
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=0');

    await db.sequelize.sync({ force: true });

    let u1 = await db.User.create({
        email: 'john@doe.com',
        password: 'a',
        firstName: 'a',
        lastName: 'a'
    });

    await db.Address.create({
        city: 'San Diego',
        state: 'California',
        country: 'USA',
        street: '1st Street',
        zip: 22434,
        userId: u1.id
    });

    let pr = await db.Product.create({
        name: 'Test',
        description: 'This is just a test product'
    });

    await db.ProductDetails.create({
        quantity: 10,
        price: 20,
        productId: pr.id
    });

    await db.Currency.bulkCreate([{
        currencyRate: 1,
        currencyCode: 'usd',
        countryName: 'United States'
    }, {
        currencyRate: 55.5,
        currencyCode: 'mkd',
        countryName: 'North Macedonia'
    }]);

    await db.Order.create({
        total: '20',
        userId: u1.id
    });

    await db.OrderItems.bulkCreate([
        { quantity: 1, productId: 1, orderId: 1 },
        // {quantity: 1, productId: 1}
    ]);


    await db.Auth.create({
        permissions: 'admin',
        userId: u1.id
    });

    await db.Vat.create({
        vat: 18
    })
})().catch(err => console.log(err));
