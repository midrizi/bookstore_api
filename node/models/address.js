module.exports = (sequelize, Sequelize) => {
    // returning user model
    return sequelize.define('Address', {
        // attributes
        street: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Street cannot be empty' }
            }
        },

        city: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'City cannot be empty' }
            }
        },

        state: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'State cannot be empty' }
            }
        },

        country: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Country cannot be empty' }
            }
        },

        zip: {
            type: Sequelize.INTEGER(6),
            allowNull: false,
            validate: {
                notNull: { msg: 'Zip cannot be empty' }
            }
        }
    }, {
        // options
        tableName: 'address',
        defaultScope: {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }
    });
};
