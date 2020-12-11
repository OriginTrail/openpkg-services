const path = require('path');

class DataPipelineController {
    constructor(ctx) {
        this.config = ctx.config;
        this.logger = ctx.logger;
        this.dataPipelineService = ctx.dataPipelineService;
        this.utilities = ctx.utilities;
        this.logger = ctx.logger;
    }

    async createPipeline(req, res) {
        try {
            this.logger.api('Create pipeline request received.');

            if (!req.body || !req.body.name || !req.body.jobs || !req.user) {
                res.status(400);
                res.send({ message: 'Params name, jobs, and user are required.' });
            }

            const pipeline_id = await this.dataPipelineService.createPipeline(req.body, req.user);
            res.status(200);
            res.send({
                data: { pipeline_id },
                status: 'COMPLETED',
                message: 'Pipeline has been successfully created.',
            });
        } catch (e) {
            this.logger.error(e.message);
            res.status(500);
            res.send({
                status: 'FAILED',
                message: e.message,
            });
        }
    }

    async deletePipeline(req, res) {
        try {
            this.logger.api('Delete pipeline request received.');

            if (!req.params.pipeline_id) {
                res.status(400);
                res.send({ message: 'Param pipeline_id is required.' });
            }

            await this.dataPipelineService.deletePipeline(req.params.pipeline_id, req.user);
            res.status(200);
            res.send({
                status: 'COMPLETED',
                message: 'Pipeline has been successfully deleted.',
            });
        } catch (e) {
            this.logger.error(e.message);
            res.status(500);
            res.send({
                status: 'FAILED',
                message: e.message,
            });
        }
    }

    async getPipelines(req, res) {
        try {
            this.logger.api('Get pipelines request received.');

            const pipelines = await this.dataPipelineService.getPipelines(req.user);
            res.status(200);
            res.send({
                data: { pipelines },
                status: 'COMPLETED',
                message: 'Pipeline has been successfully retrieved.',
            });
        } catch (e) {
            this.logger.error(e.message);
            res.status(500);
            res.send({
                status: 'FAILED',
                message: e.message,
            });
        }
    }

    async getPipelineDetails(req, res) {
        try {
            this.logger.api('Get pipeline details request received.');

            if (!req.params.pipeline_id) {
                res.status(400);
                res.send({ message: 'Param pipeline_id is required.' });
            }

            const pipeline = await this.dataPipelineService.getPipelineDetails(
                req.params.pipeline_id,
                req.user,
            );
            res.status(200);
            res.send({
                data: { pipeline },
                status: 'COMPLETED',
                message: 'Pipeline details has been successfully retrieved.',
            });
        } catch (e) {
            this.logger.error(e.message);
            res.status(500);
            res.send({
                status: 'FAILED',
                message: e.message,
            });
        }
    }

    async getPipelineInstanceDetails(req, res) {
        try {
            this.logger.api('Get pipeline instance details request received.');

            if (!req.params.pipeline_instance_id) {
                res.status(400);
                res.send({ message: 'Param pipeline_instance_id is required.' });
            }

            const pipeline = await this.dataPipelineService.getPipelineInstanceDetails(
                req.params.pipeline_instance_id,
                req.user,
            );

            pipeline.pipeline_instance_result = JSON.parse(pipeline.pipeline_instance_result);
            if (pipeline.pipeline_instance_result) {
                if (pipeline.pipeline_instance_result.files) {
                    for (const file_path of pipeline.pipeline_instance_result.files) {
                        let content = {};
                        if (path.extname(file_path).toLowerCase() === '.json') {
                            content = JSON.parse(this.utilities.readFile(file_path));
                        } else {
                            content = this.utilities.readFile(file_path, 'utf8');
                        }

                        pipeline.pipeline_instance_result[
                            path.basename(file_path, path.extname(file_path))
                        ] = content;
                    }
                    delete pipeline.pipeline_instance_result.files;
                }

                pipeline.pipeline_instance_result = {
                    ...pipeline.pipeline_instance_result,
                    ...pipeline.pipeline_instance_result.body,
                };

                delete pipeline.pipeline_instance_result.body;
                delete pipeline.pipeline_instance_result.pipeline_instance_id;
            } else {
                pipeline.pipeline_instance_result = {};
            }

            res.status(200);
            res.send({
                data: { pipeline },
                status: 'COMPLETED',
                message: 'Pipeline instance details has been successfully retrieved.',
            });
        } catch (e) {
            this.logger.error(e.message);
            res.status(500);
            res.send({
                status: 'FAILED',
                message: e.message,
            });
        }
    }

    async triggerPipeline(req, res) {
        try {
            this.logger.api('Trigger pipeline request received.');

            if (!req.params.pipeline_id || !req.user) {
                res.status(400);
                res.send({ message: 'Params pipeline_id and user are required.' });
            }

            const pipeline_instance_id = await this.dataPipelineService.triggerPipeline(
                req.params.pipeline_id,
                { body: req.body, files: req.files },
                req.user,
            );
            res.status(200);
            res.send({
                data: { pipeline_instance_id },
                status: 'COMPLETED',
                message: 'Pipeline has been successfully created.',
            });
        } catch (e) {
            this.logger.error(e.message);
            res.status(500);
            res.send({
                status: 'FAILED',
                message: e.message,
            });
        }
    }
}

module.exports = DataPipelineController;
