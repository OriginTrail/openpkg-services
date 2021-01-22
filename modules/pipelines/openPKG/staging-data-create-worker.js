const NodeRestClient = require('../../utilities/node-rest-client');
const Utilities = require('../../utilities/utilities');

process.on('message', async (dataFromParent) => {
    const {
        body, pipeline_instance_id
    } = JSON.parse(dataFromParent);

    try {
        const {otObject, node_ip, publishing, size_limit} = body;

        const client = new NodeRestClient(node_ip);
        const response = await client.stagingDataCreateRequest([otObject]);
        if (response.status==='FAILED')
            throw new Error('Failed to save otObject in staging data store');

        let stagingObjects = await client.stagingDataGetRequest();
        if (publishing && stagingObjects.data.length > size_limit) {
            let importResponse = await client.stagingDataPublishRequest();
            let status, result;
            do {
                await Utilities.sleepForMilliseconds(2000);
                result = await client.importStatus(importResponse.handler_id);
                status = result.status;
            }while (!['FAILED', 'COMPLETED'].includes(status));
            if (status === 'FAILED')
                throw new Error(result.data.error);

            await client.replicationRequest(result.data.dataset_id, 'graph');
        }

        process.send(JSON.stringify({
            pipeline_instance_id,
            body: { status: response.status },
            files: [],
        }), () => {
            process.exit(0);
        });
    } catch (e) {
        process.send({ error: `${e.message}` });
    }
});

process.once('SIGTERM', () => process.exit(0));
