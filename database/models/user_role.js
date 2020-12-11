const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const user_role = sequelize.define('user_role', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        user_id: DataTypes.STRING,
        role_id: DataTypes.STRING,
    }, {});
    user_role.associate = (models) => {
        user_role.belongsTo(models.user, { foreignKey: 'user_id' });
        user_role.belongsTo(models.role, { foreignKey: 'role_id' });
    };
    return user_role;
};
