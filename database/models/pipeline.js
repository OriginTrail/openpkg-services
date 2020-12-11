const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const pipeline = sequelize.define('pipeline', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        created_by: DataTypes.STRING,
    }, {});
    pipeline.associate = (models) => {
        pipeline.hasMany(models.job, { as: 'jobs' });
        pipeline.hasMany(models.pipeline_instance, { as: 'pipeline_instances' });
        pipeline.belongsToMany(models.role, { through: 'role_pipeline', foreignKey: 'role_id', as: 'roles' });
    };
    return pipeline;
};
