const PipelineCommand = require('../pipeline-command');
const { fork } = require('child_process');

class DataDeletePermissionedDataRemoveCommand extends PipelineCommand {
    constructor(ctx) {
        super(ctx);
        this.logger = ctx.logger;
        this.commandExecutor = ctx.commandExecutor;
    }

    /**
     * Executes command and produces one or more events
     * @param command
     */
    async executeTask(command) {
        const forked = fork('modules/pipelines/openPKG/permissioned-data-remove-worker.js');
        command.data.body.query = {
            identifier_value: command.data.body.response.map(x => x.otObject['@id'])[0],
            identifier_type: 'id',
            dataset_id: command.data.body.response.map(x => x.datasets[0])[0]
        }
        forked.send(JSON.stringify(command.data));

        forked.on('message', async (response) => {
            const objects = this.unpackForkData(response);
            let { data } = objects;
            data.body.query = command.data.body.response.map(x => x.otObject['@id']);
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
            name: 'dataDeletePermissionedDataRemoveCommand',
            delay: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

module.exports = DataDeletePermissionedDataRemoveCommand;
