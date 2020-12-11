const AuthenticationUtilities = require('../utilities/authentication-utilities');

class RestAPIService {
    constructor(ctx) {
        this.config = ctx.config;
        this.logger = ctx.logger;
        this.config = ctx.config;
        this.version_id = this.config.latest_api_version;
        this.dataPipelineController = ctx.dataPipelineController;
    }

    /**
     * API Routes
     */
    _exposeAPIRoutes(server, passport) {
        server.post(
            `/api/${this.version_id}/pipeline`,
            passport.authenticate('bearer', { session: false }),
            async (req, res) => {
                await this.dataPipelineController.createPipeline(req, res);
            },
        );

        server.del(
            `/api/${this.version_id}/pipeline/:pipeline_id`,
            passport.authenticate('bearer', { session: false }),
            async (req, res) => {
                await this.dataPipelineController.deletePipeline(req, res);
            },
        );

        server.get(
            `/api/${this.version_id}/pipelines`,
            passport.authenticate('bearer', { session: false }),
            async (req, res) => {
                await this.dataPipelineController.getPipelines(req, res);
            },
        );

        server.get(
            `/api/${this.version_id}/pipeline/:pipeline_id`,
            passport.authenticate('bearer', { session: false }),
            async (req, res) => {
                await this.dataPipelineController.getPipelineDetails(req, res);
            },
        );

        server.get(
            `/api/${this.version_id}/pipeline/instance/:pipeline_instance_id`,
            passport.authenticate('bearer', { session: false }),
            async (req, res) => {
                await this.dataPipelineController.getPipelineInstanceDetails(req, res);
            },
        );

        server.post(
            `/api/${this.version_id}/pipeline/instance/:pipeline_id`,
            passport.authenticate('bearer', { session: false }),
            async (req, res) => {
                await this.dataPipelineController.triggerPipeline(req, res);
            },
        );
    }
}

module.exports = RestAPIService;
