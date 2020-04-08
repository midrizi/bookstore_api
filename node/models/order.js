module.exports = (sequelize, Sequelize) => {
    // returning user model
    return sequelize.define('Order', {
        // attributes
        status: {
            type: Sequelize.ENUM('pending', 'complete'),
            defaultValue: 'pending'
        },

        total: {
            type: Sequelize.DECIMAL(6, 2),
            defaultValue: 0
        },
    }, {
        // options
        tableName: 'order',
        defaultScope: {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }
    });
};
