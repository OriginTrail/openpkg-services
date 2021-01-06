const NodeRestClient = require('../../utilities/node-rest-client');
const Utilities = require('../../utilities/utilities');

process.on('message', async (dataFromParent) => {
    const {
        pipeline_instance_id, body
    } = JSON.parse(dataFromParent);

    try {
        const client = new NodeRestClient(body.node_ip);
        const response = await client.stagingDataPublishRequest();
        let status, result;
        do {
            await Utilities.sleepForMilliseconds(2000);
            result = await client.importStatus(response.handler_id);
            status = result.status;
        }while (!['FAILED', 'COMPLETED'].includes(status));
        if (status === 'FAILED')
            throw new Error(result.data.error);
        process.send(JSON.stringify({
            pipeline_instance_id,
            body: { dataset_id: result.data.dataset_id },
            files: [],
        }), () => {
            process.exit(0);
        });
    } catch (e) {
        process.send({ error: `${e.message}` });
    }
});

process.once('SIGTERM', () => process.exit(0));
