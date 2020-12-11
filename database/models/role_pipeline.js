const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const role_pipeline = sequelize.define('role_pipeline', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        role_id: DataTypes.STRING,
        pipeline_id: DataTypes.STRING,
    }, {});
    role_pipeline.associate = (models) => {
        role_pipeline.belongsTo(models.pipeline, { foreignKey: 'pipeline_id' });
        role_pipeline.belongsTo(models.role, { foreignKey: 'role_id' });
    };
    return role_pipeline;
};
