module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('tasks', {
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
        order: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        command_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        job_id: {
            type: Sequelize.STRING,
            allowNull: false,
            onDelete: 'CASCADE',
            references: {
                model: 'jobs',
                key: 'id',
            },
        },
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('tasks'),
};
