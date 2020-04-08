const bcrypt = require('bcryptjs');

module.exports = (sequelize, Sequelize) => {
    // returning user model
    const User = sequelize.define('User', {
        // attributes
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: 'Email cannot be empty' },
                isEmail: {
                    args: [true],
                    msg: 'Please provide a valid email address'
                }
            }
        },

        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'First Name cannot be empty' }
            }
        },

        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Last Name cannot be empty' }
            }
        },

        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Password cannot be empty' }
            }
        },
    }, {
        // options
        tableName: 'users',
        defaultScope: {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }
    });


    // hashing user password before creation of the user
    User.beforeCreate(async (user, options) => {
        user.password = await bcrypt.hash(user.password, 10);
    });

    return User
};
