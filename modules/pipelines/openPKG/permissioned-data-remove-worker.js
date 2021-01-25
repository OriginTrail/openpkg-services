const NodeRestClient = require('../../utilities/node-rest-client');

process.on('message', async (dataFromParent) => {
    const {
        body, pipeline_instance_id
    } = JSON.parse(dataFromParent);

    try {
        const { response, node_ip } = body;
        const client = new NodeRestClient(node_ip);

        for (const object of response) {

            const query = {
                identifier_value: object.otObject['@id'],
                identifier_type: 'id',
                dataset_id:  object.dataset_id
            };
            const response = await client.permissionedDataRemoveRequest(query);
            // if (response.status === 'FAILED')
            //     throw new Error('Remove permissioned data is not successful');
        }
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
