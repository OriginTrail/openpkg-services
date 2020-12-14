const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

class NodeRestClient {
    constructor(node) {
        this.node = node;
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

        return response;
    }

    async stagingDataPublishRequest() {
        const response = await axios.post(
            `${this.node}/api/latest/staging_data/publish`
        );

        return response;
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

        return response;
    }
}

module.exports = NodeRestClient;
