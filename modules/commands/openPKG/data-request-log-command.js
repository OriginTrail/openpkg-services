const PipelineCommand = require('../pipeline-command');
const { fork } = require('child_process');

class DataRequestLogCommand extends PipelineCommand {
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

        // const { entity, publicKey } = body;
        // const timestamp = Date.now();
        // command.data.body.otObject = {
        //         "@id":`did:ethr:${publicKey}#${entity}#${timestamp}`,
        //         "@type":"otObject",
        //         "identifiers":[
        //             {
        //                 "@type":"id",
        //                 "@value":`did:ethr:${publicKey}`
        //             },
        //             {
        //                 "@type":"id",
        //                 "@value": entity
        //             },
        //             {
        //                 "@type":"timestamp",
        //                 "@value": timestamp
        //             },
        //             {
        //                 "@type":"id",
        //                 "@value": `did:ethr:${publicKey}#${entity}#${timestamp}`
        //             },
        //         ],
        //         "properties":{
        //             "permissioned_data": {
        //                 "data": {
        //                     "@context": [
        //                         "https://w3id.org/credentials/v1"
        //                     ],
        //                     "claim": {
        //                         "request":{message: body.message,entity: body.entity,publicKey: body.publicKey, timestamp: body.timestamp,},
        //                     },
        //                     "expires": "2099-01-01",
        //                     "id": `did:ethr:${publicKey}#${timestamp}`,
        //                     "issuer": `did:ethr:${publicKey}`,
        //                     "type": [
        //                         "VerifiableCredential"
        //                     ]
        //                 }
        //             }
        //         },
        //         "relations":[
        //
        //         ]
        //     };

        const forked = fork('modules/pipelines/openPKG/staging-data-create-worker.js');

        command.data.body.node_ip = this.config.node_ip;
        command.data.body.size_limit = this.config.publishing.size_limit;
        command.data.body.publishing = this.config.publishing.enabled;
        forked.send(JSON.stringify(command.data));

        forked.on('message', async (response) => {
            const objects = this.unpackForkData(response);
            let { data } = objects;
            data.body = {response: command.data.body.response, logs: command.data.body.logs};
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
            name: 'dataRequestLogCommand',
            delay: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

module.exports = DataRequestLogCommand;
