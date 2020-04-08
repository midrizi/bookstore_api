module.exports = (sequelize, Sequelize) => {
    // returning user model
    return sequelize.define('OrderItems', {
        // attributes
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: 'Quantity cannot be empty' }
            }
        }
    }, {
        // options
        tableName: 'order_items',
        freezeTableName: true,

        defaultScope: {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }
    });
};
