const NodeRestClient = require('../../utilities/node-rest-client');
const Utilities = require('../../utilities/utilities');

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
            await Utilities.sleepForMilliseconds(1000);
            response = await client.trailFindRequestResult(handler_id);
            status = response.status;
        }while (!['FAILED', 'COMPLETED'].includes(status));

        if (status === 'FAILED')
            throw new Error(result.data.error);

        const proofRequests = {};
        for (let i =0;i < response.data.length; i+=1){
            if (!proofRequests[response.data[i].datasets[0]]){
                proofRequests[response.data[i].datasets[0]] = [];
            }

            proofRequests[response.data[i].datasets[0]].push(response.data[i].otObject['@id']);
        }

        response = [];
        for (let i =0;i < Object.keys(proofRequests).length; i+=1){
            const request = { dataset_id: Object.keys(proofRequests)[i], object_ids: proofRequests[Object.keys(proofRequests)[i]] };
            const localResponse = await client.trailProofsRequest(request);
            for (const object of localResponse) {
                object.dataset_id = Object.keys(proofRequests)[i];
            }
            response = response.concat(localResponse);
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
