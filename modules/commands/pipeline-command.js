const Command = require('@tracelabs/command-executor/modules/command');
const CommandExecutor = require('@tracelabs/command-executor/modules/command-executor');

/**
 * Describes one command handler
 */
class PipelineCommand extends Command {
    constructor(ctx) {
        super(ctx);
        this.dataPipelineService = ctx.dataPipelineService;
        this.commandResolver = ctx.commandResolver;
        this.commandExecutor = ctx.commandExecutor;
    }

    async beforeTaskExecution(command) {
        if (!command.data.pipeline_instance_id) {
            command.data.pipeline_instance_id =
                await this.dataPipelineService.createPipelineInstance(command.name);
        }

        await this.dataPipelineService.updateTaskInstance(command.data.pipeline_instance_id, command.name, 'IN PROGRESS', '');
    }

    async execute(command, transaction) {
        await this.beforeTaskExecution(command, transaction);

        let data = {};
        let status;
        let message;
        try {
            data = await this.executeTask(command, transaction);
            status = 'COMPLETED';
            message = '';
        } catch (e) {
            status = 'FAILED';
            // eslint-disable-next-line prefer-destructuring
            message = e.message;
        }

        if (!data) {
            return Command.empty();
        }

        command.sync = true;
        // eslint-disable-next-line no-return-await
        return await this.afterTaskExecution(command, data, status, message);
    }

    unpackForkData(response) {
        let status;
        let message;
        let data = {};
        if (response.error) {
            status = 'FAILED';
            // eslint-disable-next-line prefer-destructuring
            message = response.error;
        } else {
            data = JSON.parse(response);
            status = 'COMPLETED';
            // eslint-disable-next-line prefer-destructuring
            message = '';
        }

        return { data, status, message };
    }

    async afterTaskExecution(command, data, status, message) {
        data.pipeline_instance_id = command.data.pipeline_instance_id;
        delete command.data.pipeline_instance_id;

        await this.dataPipelineService.updateTaskInstance(
            data.pipeline_instance_id,
            command.name, status,
            message, data || {},
        );

        if (await this.dataPipelineService.isTriggerCommand(command.name)) {
            if (this.commandResolver.resolve(command.name).default().automatic_start) {
                await this.commandExecutor.add({
                    name: command.sequence[0],
                    sequence: command.sequence.slice(1),
                    delay: 0,
                    transactional: false,
                    data,
                });


                if (command.sync) {
                    return Command.repeat();
                }
                await CommandExecutor._update(command, {
                    status: 'REPEATING',
                }, null);

                command.data = this.pack(command.data);

                const period = command.period ?
                    command.period : 5000;
                await this.add(command, period, false);
                // await this.commandExecutor.add(command, command.period, false);
            }
        }

        if (command.sequence.length > 0) {
            if (command.sync) {
                return this.continueSequence(data, command.sequence);
            }

            const commands = this.continueSequence(data, command.sequence);
            const children = commands.commands.map((c) => {
                c.parent_id = command.id;
                return c;
            });

            await Promise.all(children.map(e => this.commandExecutor._insert(e, null)));
            await CommandExecutor._update(command, {
                status: 'COMPLETED',
            }, null);

            children.forEach(async e => this.commandExecutor.add(e, e.delay, false));
        }
        return Command.empty();
    }

    async executeTask(command, transaction) {
        return command;
    }
}

module.exports = PipelineCommand;
