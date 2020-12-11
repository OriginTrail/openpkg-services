module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('job_instances', {
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
        pipeline_instance_id: {
            type: Sequelize.STRING,
            allowNull: false,
            onDelete: 'CASCADE',
            references: {
                model: 'pipeline_instances',
                key: 'id',
            },
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
        created_at: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        modified_at: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('job_instances'),
};
