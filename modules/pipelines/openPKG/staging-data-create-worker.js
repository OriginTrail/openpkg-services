const NodeRestClient = require('../../utilities/node-rest-client');

process.on('message', async (dataFromParent) => {
    const {
        body, pipeline_instance_id
    } = JSON.parse(dataFromParent);

    try {
        const {otObject, node_ip} = body;

        const client = new NodeRestClient(node_ip);
        const response = await client.stagingDataCreateRequest([otObject]);
        if (response.status==='FAILED')
            throw new Error('Failed to save otObject in staging data store');
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
