const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const role = sequelize.define('role', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        is_admin: DataTypes.BOOLEAN,
    }, {});
    role.associate = (models) => {
        role.belongsToMany(models.user, { through: 'user_role', foreignKey: 'role_id', as: 'users' });
        role.belongsToMany(models.pipeline, { through: 'role_pipeline', foreignKey: 'role_id', as: 'pipelines' });
    };
    return role;
};
