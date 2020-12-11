const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const task = sequelize.define('task', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        order: DataTypes.INTEGER,
        command_name: DataTypes.STRING,
        job_id: DataTypes.STRING,
    }, {});
    task.associate = (models) => {
        task.belongsTo(models.job, { foreignKey: 'job_id', as: 'job' });
        task.hasMany(models.task_instance, { as: 'task_instances' });
    };
    return task;
};
