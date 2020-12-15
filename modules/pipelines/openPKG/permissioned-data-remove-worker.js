const NodeRestClient = require('../../utilities/node-rest-client');

process.on('message', async (dataFromParent) => {
    const {
        body, pipeline_instance_id
    } = JSON.parse(dataFromParent);

    const { query } = body;

    try {
        const client = new NodeRestClient('http://127.0.0.1:8900');
        const response = await client.permissionedDataRemoveRequest(query);
        if (response.status === 'FAILED')
            throw new Error('Remove permissioned data is not successful');
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
