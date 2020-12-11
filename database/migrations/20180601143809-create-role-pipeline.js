module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('role_pipelines', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING,
        },
        role_id: {
            type: Sequelize.STRING,
            allowNull: false,
            onDelete: 'CASCADE',
            references: {
                model: 'roles',
                key: 'id',
            },
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
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('role_pipelines'),
};
