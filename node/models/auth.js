module.exports = (sequelize, Sequelize) => {
    // returning user model
    return sequelize.define('Auth', {
        // attributes
        permissions: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Permissions cannot be empty' }
            }
        },
    }, {
        // options
        tableName: 'auth',
        freezeTableName: true,

        defaultScope: {
            attributes: {
                exclude: ['id', 'userId', 'createdAt', 'updatedAt']
            }
        }
    });
};
