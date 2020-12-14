const NodeRestClient = require('../../utilities/node-rest-client');

process.on('message', async (dataFromParent) => {
    const {
        body, pipeline_instance_id
    } = JSON.parse(dataFromParent);

    const {otObject} = body;

    try {
        const client = new NodeRestClient('http://127.0.0.1:8900');
        const response = await client.didResolveRequest(otObject['@id']);
        if (response.status==='FAILED')
            throw new Error('Invalid DID identifier');
        process.send(JSON.stringify({
            pipeline_instance_id,
            body,
            files: [],
        }), () => {
            process.exit(0);
        });
    } catch (e) {
        process.send({ error: `${e.message}` });
    }
});

process.once('SIGTERM', () => process.exit(0));
