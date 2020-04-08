module.exports = (sequelize, Sequelize) => {
    // returning product model
    return sequelize.define('ProductImages', {
        // attributes
        url: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Photo URL cannot be empty' }
            }
        }
    }, {
        // options
        tableName: 'product_images',
        freezeTableName: true,

        defaultScope: {
            attributes: {
                exclude: ['productId', 'createdAt', 'updatedAt']
            }
        }
    })
};
