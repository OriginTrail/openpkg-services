const PipelineCommand = require('../pipeline-command');
const { fork } = require('child_process');

class DataDeleteDidResolveCommand extends PipelineCommand {
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
        const forked = fork('modules/pipelines/openPKG/did-resolve-worker.js');
        command.data.body.didUrl = `did:ethr:development:${command.data.body.publicKey}`;
        command.data.body.node_ip = this.config.node_ip;
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
            name: 'dataDeleteDidResolveCommand',
            delay: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

module.exports = DataDeleteDidResolveCommand;
