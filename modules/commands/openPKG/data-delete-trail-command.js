const PipelineCommand = require('../pipeline-command');
const { fork } = require('child_process');

class DataDeleteTrailCommand extends PipelineCommand {
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
        const forked = fork('modules/pipelines/openPKG/trail-worker.js');
        command.data.body.query ={
            "identifier_types": ['id'],
            "identifier_values": [command.data.body.didUrl],
            "depth": 10,
        };
        forked.send(JSON.stringify(command.data));

        forked.on('message', async (response) => {
            const { data, status, message } = this.unpackForkData(response);
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
     * Builds default StagingDataCreateCommand
     * @param map
     * @returns {{add, data: *, delay: *, deadline: *}}
     */
    default(map) {
        const command = {
            name: 'dataDeleteTrailCommand',
            delay: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

module.exports = DataDeleteTrailCommand;
