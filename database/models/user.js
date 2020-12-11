const uuid = require('uuid');
const models = require('./index');

module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define('user', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuid.v4(),
        },
        email: DataTypes.STRING,
        public_key: DataTypes.STRING,
        token: DataTypes.STRING,
    }, {
        instanceMethods: {
            isAdmin() {
                const user_roles = models.user_role.findAll({
                    where: {
                        user_id: this.id,
                    },
                });

                user_roles.forEach((user_role) => {
                    const role = models.role.findOne({
                        where: {
                            id: user_role.id,
                            is_admin: true,
                        },
                    });

                    if (role) { return true; }
                });

                return false;
            },
        },
    });
    user.associate = (models) => {
        user.belongsToMany(models.role, { through: 'user_role', foreignKey: 'user_id', as: 'roles' });
    };
    return user;
};
