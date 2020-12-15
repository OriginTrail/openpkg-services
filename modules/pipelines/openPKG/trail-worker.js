const NodeRestClient = require('../../utilities/node-rest-client');
const sleep = require('sleep');

process.on('message', async (dataFromParent) => {
    const {
        body,
        pipeline_instance_id
    } = JSON.parse(dataFromParent);

    const { query } = body;

    try {
        const client = new NodeRestClient('http://127.0.0.1:8900');
        const response = await client.trailRequest(query);
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
