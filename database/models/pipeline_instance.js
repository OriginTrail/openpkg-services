const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const pipeline_instance = sequelize.define('pipeline_instance', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        status: DataTypes.STRING,
        message: DataTypes.STRING,
        pipeline_id: DataTypes.STRING,
        data: DataTypes.STRING,
        created_at: DataTypes.INTEGER,
        modified_at: DataTypes.INTEGER,
    }, {});
    pipeline_instance.associate = (models) => {
        pipeline_instance.belongsTo(models.pipeline, { foreignKey: 'pipeline_id', as: 'pipeline' });
        pipeline_instance.hasMany(models.job_instance, { as: 'job_instances' });
    };
    return pipeline_instance;
};
