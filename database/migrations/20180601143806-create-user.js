module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('users', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        public_key: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        token: {
            type: Sequelize.STRING,
        },
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('users'),
};
