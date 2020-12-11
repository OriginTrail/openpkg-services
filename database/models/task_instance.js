const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const task_instance = sequelize.define('task_instance', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        status: DataTypes.STRING,
        message: DataTypes.STRING,
        task_id: DataTypes.STRING,
        job_instance_id: DataTypes.STRING,
        created_at: DataTypes.INTEGER,
        modified_at: DataTypes.INTEGER,
    }, {});
    task_instance.associate = (models) => {
        task_instance.belongsTo(models.task, { foreignKey: 'task_id', as: 'task' });
        task_instance.belongsTo(models.job_instance, { foreignKey: 'job_instance_id', as: 'job_instance' });
    };
    return task_instance;
};
