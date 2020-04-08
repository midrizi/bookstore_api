module.exports = (sequelize, Sequelize) => {
    // returning product model
    return sequelize.define('Vat', {
        // attributes
        vat: {
            type: Sequelize.TINYINT,
            primaryKey: true
        }
    }, {
        // options
        tableName: 'vat',
        freezeTableName: true
    })
};
