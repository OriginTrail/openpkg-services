const NodeRestClient = require('../../utilities/node-rest-client');
const PipelineCommand = require('../pipeline-command');
const { fork } = require('child_process');

class DataDeleteStagingDataRemoveCommand extends PipelineCommand {
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
        const forked = fork('modules/pipelines/openPKG/staging-data-remove-worker.js');

        const client = new NodeRestClient(this.config.node_ip);
        let stagingObjects = await client.stagingDataGetRequest();
        stagingObjects = stagingObjects.data.filter(x=>
            x.identifiers.map(y=>y['@value']).includes(body.didUrl) &&
            x.identifiers.map(y=>y['@value']).includes(body.entity));

        command.data.body.response = stagingObjects.map(x=>x['@id']);
        command.data.body.node_ip = this.config.node_ip;
        forked.send(JSON.stringify(command.data));

        forked.on('message', async (response) => {
            const objects = this.unpackForkData(response);
            let { data } = objects;
            data.body = command.data.body;
            const { status, message } = objects;
            await PipelineCommand.prototype.afterTaskExecution.call(
                this,
                command,
                data, status,
                message,
            );
            forked.kill();
        });
    }


    /**
     * Builds default DataDeleteStagingDataRemoveCommand
     * @param map
     * @returns {{add, data: *, delay: *, deadline: *}}
     */
    default(map) {
        const command = {
            name: 'dataDeleteStagingDataRemoveCommand',
            delay: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

module.exports = DataDeleteStagingDataRemoveCommand;
