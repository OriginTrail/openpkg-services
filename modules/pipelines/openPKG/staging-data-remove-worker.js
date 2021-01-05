const NodeRestClient = require('../../utilities/node-rest-client');

process.on('message', async (dataFromParent) => {
    const {
        body, pipeline_instance_id
    } = JSON.parse(dataFromParent);

    try {
        const { response, node_ip } = body;
        const client = new NodeRestClient(node_ip);
        const { status } = await client.stagingDataRemoveRequest(response);
        if (status === 'FAILED')
            throw new Error(result.data.error);
        process.send(JSON.stringify({
            pipeline_instance_id,
            body: { response },
            files: [],
        }), () => {
            process.exit(0);
        });
    } catch (e) {
        process.send({ error: `${e.message}` });
    }
});

process.once('SIGTERM', () => process.exit(0));
