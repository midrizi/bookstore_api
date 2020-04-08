module.exports = (sequelize, Sequelize) => {
    // returning product model
    return sequelize.define('Product', {
        // attributes
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Product name cannot be empty' }
            }
        },

        description: {
            type: Sequelize.STRING(2500),
            allowNull: false,
            validate: {
                notNull: { msg: 'Description cannot be empty' }
            }
        }
    }, {
        // options
        tableName: 'products',
        freezeTableName: true,

        defaultScope: {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }
    });
};
