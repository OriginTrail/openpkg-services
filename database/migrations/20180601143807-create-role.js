module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('roles', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        is_admin: {
            type: Sequelize.BOOLEAN,
        },
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('roles'),
};
