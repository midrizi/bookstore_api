module.exports = (sequelize, Sequelize) => {
    // returning user model
    return sequelize.define('Currency', {
        // attributes
        currencyCode: {
            type: Sequelize.STRING(5),
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: 'Country code cannot be empty' }
            }
        },

        countryName: {
            type: Sequelize.STRING,
        },

        currencyRate: {
            type: Sequelize.DECIMAL(6, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Currency rate cannot be empty' }
            }
        },
    }, {
        // options
        tableName: 'currencies',
        freezeTableName: true,

        defaultScope: {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        },
    });
};
