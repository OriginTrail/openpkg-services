require('dotenv').config();
const path = require('path');
const homedir = require('os').homedir();
const pjson = require('../package.json');

if (!process.env.ENV) {
    // Environment not set. Use the production.
    process.env.ENV = 'development';
}

const storagePath = process.env.DATABASE_DATA_PIPELINE_PATH ?
    process.env.DATABASE_DATA_PIPELINE_PATH :
    path.join(homedir, `${pjson.name}`, 'database', 'system.db');

module.exports = {
    [process.env.ENV]: {
        database: 'main',
        host: '127.0.0.1',
        dialect: 'sqlite',
        password: process.env.DATABASE_DATA_PIPELINE_PASSWORD,
        storage: storagePath,
        migrationStorageTableName: 'sequelize_meta',
        logging: false,
        operatorsAliases: false,
        define: {
            underscored: true,
            timestamps: false,
        },
        retry: {
            match: [
                /SQLITE_BUSY/,
            ],
            name: 'query',
            max: 5,
        },
    },
};
