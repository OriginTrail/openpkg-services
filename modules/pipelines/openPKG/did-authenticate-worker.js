const NodeRestClient = require('../../utilities/node-rest-client');

process.on('message', async (dataFromParent) => {
    const {
        body, pipeline_instance_id
    } = JSON.parse(dataFromParent);

    try {
        const client = new NodeRestClient(body.node_ip);
        const response = await client.didAuthenticateRequest(body);
        // if (response.authenticated)
        //     throw new Error('User is not authenticated!');
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
