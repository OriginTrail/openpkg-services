const NodeRestClient = require('../../utilities/node-rest-client');
const sleep = require('sleep');

process.on('message', async (dataFromParent) => {
    const {
        body,
        pipeline_instance_id
    } = JSON.parse(dataFromParent);

    try {
        const { dataset_id, node_ip } = body;

        const client = new NodeRestClient(node_ip);
        const response = await client.replicationRequest(dataset_id, 'graph');
        let status, result;
        do {
            sleep.sleep(10);
            result = await client.replicationStatus(response.handler_id);
            status = result.status;
        }while (!['FAILED', 'COMPLETED'].includes(status));
        if (status === 'FAILED')
            throw new Error(result.data.error);
        process.send(JSON.stringify({
            pipeline_instance_id,
            body: { replication_data: result.data },
            files: [],
        }), () => {
            process.exit(0);
        });
    } catch (e) {
        process.send({ error: `${e.message}` });
    }
});

process.once('SIGTERM', () => process.exit(0));
