module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('pipelines', {
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
        created_by: {
            type: Sequelize.STRING,
            allowNull: false,
            onDelete: 'CASCADE',
            references: {
                model: 'users',
                key: 'id',
            },
        },
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('pipelines'),
};
