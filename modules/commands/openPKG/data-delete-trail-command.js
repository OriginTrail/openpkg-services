const PipelineCommand = require('../pipeline-command');
const { fork } = require('child_process');

class DataDeleteTrailCommand extends PipelineCommand {
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
        const forked = fork('modules/pipelines/openPKG/trail-worker.js');
        command.data.body.query ={
            "identifier_types": ['id', 'id'],
            "identifier_values": [command.data.body.didUrl, command.data.body.entity],
            "opcode": "EQ",
        };
        command.data.body.node_ip = this.config.node_ip;
        forked.send(JSON.stringify(command.data));

        forked.on('message', async (response) => {
            const objects = this.unpackForkData(response);
            let { data } = objects;
            data.body = {...command.data.body, ...data.body};
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
