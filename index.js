const CommandExecutorController = require('@tracelabs/command-executor');
const awilix = require('awilix');
const configjson = require('./config/config.json');
const RestApiController = require('./modules/controller/rest-api-controller');
const DataPipelineController = require('./modules/controller/data-pipeline-controller');
const DataPipelineService = require('./modules/services/data-pipeline-service');
const Utilities = require('./modules/utilities/utilities');

async function main() {
    const config = configjson[process.env.ENV &&
        ['development', 'staging', 'production'].indexOf(process.env.ENV) >= 0 ?
        process.env.ENV : 'development'];

    const commandExecutorController = new CommandExecutorController();
    const logger = commandExecutorController.resolve('logger');
    const container = commandExecutorController.getContainer();
    container.register({
        config: awilix.asValue(config),
        logger: awilix.asValue(logger),
        restApiController: awilix.asClass(RestApiController).singleton(),
        dataPipelineController: awilix.asClass(DataPipelineController).singleton(),
        dataPipelineService: awilix.asClass(DataPipelineService).singleton(),
        utilities: awilix.asClass(Utilities).singleton(),
    });

    try {
        const restApiController = container.resolve('restApiController');
        const dataPipelineService = container.resolve('dataPipelineService');

        await dataPipelineService.setupEnvironment();

        await restApiController.startRPC();
        await commandExecutorController.init(['lifecycleCommand'], ['modules/commands/**/*.js']);
        await commandExecutorController.start();
    } catch (err) {
        logger.error(err.message);
        process.exit(1);
    }
}

main();
