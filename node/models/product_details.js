module.exports = (sequelize, Sequelize) => {
    // returning product model
    return sequelize.define('ProductDetails', {
        // attributes
        price: {
            type: Sequelize.DECIMAL(6, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Price cannot be empty' }
            }
        },

        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: 'Quantity cannot be empty' }
            }
        }
    }, {
        tableName: 'product_details',

        // options
        defaultScope: {
            attributes: {
                exclude: ['id', 'productId', 'createdAt', 'updatedAt']
            }
        },
    })
};
