const PipelineCommand = require('../pipeline-command');
const { fork } = require('child_process');

class DataCollectionPrepareCommand extends PipelineCommand {
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
        const {
            body, pipeline_instance_id
        } = command.data;

        const { activityObject, publicKey } = body;
        const otObject = {
                "@id":`did:ethr:development:${publicKey}`,
                "@type":"otObject",
                "identifiers":[
                    {
                        "@type":"id",
                        "@value":`did:ethr:development:${publicKey}`
                    }
                ],
                "properties":{
                    "permissioned_data": {
                        "data": {
                            activityObject
                        }
                    }
                },
                "relations":[

                ]
            };

        return {
            pipeline_instance_id,
            body: { otObject },
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
            name: 'dataCollectionPrepareCommand',
            delay: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

module.exports = DataCollectionPrepareCommand;
