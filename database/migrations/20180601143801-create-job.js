module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('jobs', {
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
    down: (queryInterface, Sequelize) => queryInterface.dropTable('jobs'),
};
