const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const job = sequelize.define('job', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        order: DataTypes.INTEGER,
        pipeline_id: DataTypes.STRING,
    }, {});
    job.associate = (models) => {
        job.belongsTo(models.pipeline, { foreignKey: 'pipeline_id', as: 'pipeline' });
        job.hasMany(models.task, { as: 'tasks' });
        job.hasMany(models.job_instance, { as: 'job_instances' });
    };
    return job;
};
