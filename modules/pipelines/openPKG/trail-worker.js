const NodeRestClient = require('../../utilities/node-rest-client');
const sleep = require('sleep');

process.on('message', async (dataFromParent) => {
    const {
        body,
        pipeline_instance_id
    } = JSON.parse(dataFromParent);

    try {
        const { query, node_ip } = body;

        const client = new NodeRestClient(node_ip);
        let uniqueIdentifiers = await client.trailLookupRequest(query);

        const subQuery = {
            "unique_identifiers": uniqueIdentifiers.map(x=>x.unique_identifier),
            "depth": 2,
        };

        const { handler_id } = await client.trailFindRequest(subQuery);
        let status, response;
        do {
            sleep.sleep(1);
            response = await client.trailFindRequestResult(handler_id);
            status = response.status;
        }while (!['FAILED', 'COMPLETED'].includes(status));

        if (status === 'FAILED')
            throw new Error(result.data.error);

        process.send(JSON.stringify({
            pipeline_instance_id,
            body: { response: response.data },
            files: [],
        }), () => {
            process.exit(0);
        });
    } catch (e) {
        process.send({ error: `${e.message}` });
    }
});

process.once('SIGTERM', () => process.exit(0));
