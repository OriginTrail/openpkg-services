const authenticationUtilities = require('./authentication-utilities');
const configjson = require('../../config/config.json');
const models = require('../../database/models');

const config = configjson[process.env.ENV &&
['development', 'staging', 'production'].indexOf(process.env.ENV) >= 0 ?
    process.env.ENV : 'development'];

async function main() {
    const token = authenticationUtilities.createBearerToken('demo@origin-trail.com', config.secret);

    let user = await models.user.findOne({
        where: {
            email: 'demo@origin-trail.com',
        },
    });

    if (!user) {
        user = await models.user.create({
            email: 'demo@origin-trail.com',
            public_key: '',
            token,
        });

        const role = await models.role.create({
            name: 'Administrator role',
            description: 'Administrator role',
            is_admin: true,
        });

        await models.user_role.create({
            user_id: user.id,
            role_id: role.id,
        });
    } else {
        await models.user.update({
            token
        }, {
            where: {
                id: user.id,
            },
        });
    }

    console.log(token);
}

main();