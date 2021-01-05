const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

class NodeRestClient {
    constructor(node) {
        this.node = node;
    }

    async stagingDataGetRequest() {
        const response = await axios.get(
            `${this.node}/api/latest/staging_data/get`
        );

        return response.data;
    }

    async stagingDataCreateRequest(array) {
        const response = await axios.post(
            `${this.node}/api/latest/staging_data/create`,
            array
        );

        return response.data;
    }

    async stagingDataRemoveRequest(array) {
        const response = await axios.post(
            `${this.node}/api/latest/staging_data/remove`,
            array
        );

        return response.data;
    }

    async stagingDataPublishRequest() {
        const response = await axios.post(
            `${this.node}/api/latest/staging_data/publish`
        );

        return response.data;
    }

    async didResolveRequest(didUrl) {
        const response = await axios.post(
            `${this.node}/api/latest/did/resolve`,
            {didUrl}
        );

        return response.data;
    }

    async didAuthenticateRequest(body) {
        const response = await axios.post(
            `${this.node}/api/latest/did/authenticate`,
            body
        );

        return response.data;
    }

    async replicationRequest(dataset_id, standard_id) {
        const response = await axios.post(
            `${this.node}/api/latest/replicate`,
            { dataset_id, standard_id }
        );

        return response.data;
    }

    async importStatus(handler_id) {
        const response = await axios.get(
            `${this.node}/api/latest/import/result/${handler_id}`
        );

        return response.data;
    }

    async replicationStatus(handler_id) {
        const response = await axios.get(
            `${this.node}/api/latest/replication/result/${handler_id}`
        );

        return response.data;
    }

    async trailLookupRequest(query) {
        const response = await axios.post(
            `${this.node}/api/latest/trail/lookup`,
            query
        );

        return response.data;
    }

    async trailFindRequest(query) {
        const response = await axios.post(
            `${this.node}/api/latest/trail/find`,
            query
        );

        return response.data;
    }

    async trailFindRequestResult(handler_id) {
        const response = await axios.get(
            `${this.node}/api/latest/trail/find/result/${handler_id}`
        );

        return response.data;
    }

    async permissionedDataRemoveRequest(query) {
        const response = await axios.post(
            `${this.node}/api/latest/permissioned_data/remove`,
            query
        );

        return response.data;
    }

}

module.exports = NodeRestClient;
