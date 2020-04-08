module.exports = (sequelize, Sequelize) => {
    // returning product model
    return sequelize.define('Category', {
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
                notNull: { msg: 'Category name cannot be empty' }
            }
        }
    }, {
        // options
        tableName: 'category',
        freezeTableName: true,

        defaultScope: {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }
    });
};
