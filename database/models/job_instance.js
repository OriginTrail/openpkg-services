const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const job_instance = sequelize.define('job_instance', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        status: DataTypes.STRING,
        message: DataTypes.STRING,
        job_id: DataTypes.STRING,
        pipeline_instance_id: DataTypes.STRING,
        created_at: DataTypes.INTEGER,
        modified_at: DataTypes.INTEGER,
    }, {});
    job_instance.associate = (models) => {
        job_instance.belongsTo(models.pipeline_instance, { foreignKey: 'pipeline_instance_id', as: 'pipeline_instance' });
        job_instance.hasMany(models.task_instance, { as: 'task_instances' });
    };
    return job_instance;
};
