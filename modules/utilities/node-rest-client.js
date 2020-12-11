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

    async stagingDataPublishRequest(array) {
        const response = await axios.post(
            `${this.node}/api/latest/staging_data/publish`
        );

        return response;
    }
}

module.exports = NodeRestClient;
