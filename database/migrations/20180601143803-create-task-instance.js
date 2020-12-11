module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('task_instances', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        message: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        job_instance_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: 'job_instances',
                key: 'id',
            },
        },
        task_id: {
            type: Sequelize.STRING,
            allowNull: false,
            onDelete: 'CASCADE',
            references: {
                model: 'tasks',
                key: 'id',
            },
        },
        created_at: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        modified_at: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('task_instances'),
};
