module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('pipeline_instances', {
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
        data: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        pipeline_id: {
            type: Sequelize.STRING,
            allowNull: false,
            onDelete: 'CASCADE',
            references: {
                model: 'pipelines',
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
    down: (queryInterface, Sequelize) => queryInterface.dropTable('pipeline_instances'),
};
