const PipelineCommand = require('../pipeline-command');
const { fork } = require('child_process');

class DataCollectionPrepareCommand extends PipelineCommand {
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

        const { activityObject, entity,timestamp, publicKey } = body;
        body.otObject = {
                "@id":`did:ethr:${publicKey}#${entity}#${timestamp}`,
                "@type":"otObject",
                "identifiers":[
                    {
                        "@type":"id",
                        "@value":`did:ethr:${publicKey}`
                    },
                    {
                        "@type":"id",
                        "@value": entity
                    },
                    {
                        "@type":"timestamp",
                        "@value": timestamp
                    },
                    {
                        "@type":"id",
                        "@value": `did:ethr:${publicKey}#${entity}#${timestamp}`
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
            name: 'dataCollectionPrepareCommand',
            delay: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

module.exports = DataCollectionPrepareCommand;
