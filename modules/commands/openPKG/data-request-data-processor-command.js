const NodeRestClient = require('../../utilities/node-rest-client');
const PipelineCommand = require('../pipeline-command');
const { fork } = require('child_process');

class DataRequestDataProcessorCommand extends PipelineCommand {
    constructor(ctx) {
        super(ctx);
        this.logger = ctx.logger;
        this.config = ctx.config;
        this.commandExecutor = ctx.commandExecutor;
    }

    /**
     * Executes command and produces one or more events
     * @param command
     */
    async executeTask(command) {
        const {
            body, pipeline_instance_id
        } = command.data;

        const client = new NodeRestClient(this.config.node_ip);
        let stagingObjects = await client.stagingDataGetRequest();
        stagingObjects = stagingObjects.data.filter(x=>
            x.identifiers.map(y=>y['@value']).includes(body.didUrl) &&
            x.identifiers.map(y=>y['@value']).includes(body.entity));

        body.response = body.response.map(x=>x.otObject.properties.permissioned_data.data).filter(x=>x != null);
        body.response = body.response.concat(stagingObjects.map(x=>x.properties.permissioned_data.data).filter(y=>y != null));

        return {
            pipeline_instance_id,
            body,
            files: [],
        };
    }


    /**
     * Builds default StagingDataCreateCommand
     * @param map
     * @returns {{add, data: *, delay: *, deadline: *}}
     */
    default(map) {
        const command = {
            name: 'dataRequestDataProcessorCommand',
            delay: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

module.exports = DataRequestDataProcessorCommand;
