const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const timeoutSeconds = 30;

class NodeRestClient {
    constructor(node) {
        this.node = null;
    }

    setNode(node) {
        this.node = node;
    }

    async stagingDataCreateRequest(array) {
        const response = await axios.post(
            `${this.node}/api/latest/staging_data/create`,
            array
        );

        return response;
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

    async didResolveRequest(body) {
        const response = await axios.post(
            `${this.node}/api/latest/did/resolve`,
            body
        );

        return response;
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
