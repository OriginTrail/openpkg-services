const NodeRestClient = require('../../utilities/node-rest-client');

process.on('message', async (dataFromParent) => {
    const {
        array, pipeline_instance_id
    } = JSON.parse(dataFromParent);

    try {
        const client = new NodeRestClient('');
        const response = client.didAuthenticateRequest(body);
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
