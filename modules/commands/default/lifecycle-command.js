const Command = require('@tracelabs/command-executor/modules/command');

class LifecycleCommand extends Command {
    constructor(ctx) {
        super(ctx);
        this.logger = ctx.logger;
        this.commandExecutor = ctx.commandExecutor;
    }

    /**
     * Executes command and produces one or more events
     * @param command
     */
    async execute(command) {
        this.logger.info('Lifecycle command executed.');
        return Command.repeat();
    }

    /**
     * Builds default lifecycleCommand
     * @param map
     * @returns {{add, data: *, delay: *, deadline: *}}
     */
    default(map) {
        const command = {
            name: 'lifecycleCommand',
            delay: 0,
            data: { },
            period: 60 * 1000,
            transactional: false,
            automatic_start: true,
        };
        Object.assign(command, map);
        return command;
    }
}

module.exports = LifecycleCommand;
