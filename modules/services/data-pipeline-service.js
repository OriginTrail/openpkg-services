const models = require('../../database/models');
const fs = require('fs');

class DataPipelineService {
    constructor(ctx) {
        this.config = ctx.config;
        this.logger = ctx.logger;
        this.commandResolver = ctx.commandResolver;
        this.commandExecutor = ctx.commandExecutor;
        this.utilities = ctx.utilities;
    }

    async createPipeline(pipeline_definition, user) {
        const pipeline = await models.pipeline.findOne({
            where: {
                name: pipeline_definition.name,
            },
        });
        if (pipeline) {
            throw Error(`Pipeline with name ${pipeline_definition.name} already exists.`);
        }

        const timestamp = Date.now();
        const pipeline_id = (await models.pipeline.create({
            name: pipeline_definition.name,
            description: pipeline_definition.description,
            created_at: timestamp,
            modified_at: timestamp,
            created_by: user.id,
        })).id;

        let promises = [];

        pipeline_definition.jobs.forEach((job, i) => {
            promises.push(models.job.create({
                name: job.name,
                description: job.description,
                pipeline_id,
                order: i,
                created_at: timestamp,
                modified_at: timestamp,
            }));
        });

        const jobs = await Promise.all(promises);

        for (const job of pipeline_definition.jobs) {
            const i = pipeline_definition.jobs.indexOf(job);
            promises = [];
            const commands = [];

            // eslint-disable-next-line no-loop-func
            job.tasks.forEach((task, j) => {
                promises.push(models.task.create({
                    name: task.name,
                    description: task.description,
                    job_id: jobs[i].id,
                    order: j,
                    command_name: task.command_name,
                    created_at: timestamp,
                    modified_at: timestamp,
                }).id);

                commands.push(task.command_name);
            });

            const command = this.commandResolver.resolve(commands[0]).default();
            if (command.automatic_start) {
                const commandSequence = commands;

                // eslint-disable-next-line no-await-in-loop
                await this.commandExecutor.add({
                    name: commandSequence[0],
                    sequence: commandSequence.slice(1),
                    delay: command.delay,
                    data: command.data,
                    period: command.period,
                    transactional: false,
                });
            }
        }

        const tasks = await Promise.all(promises);

        return pipeline_id;
    }

    async deletePipeline(pipeline_id, user) {
        await models.pipeline.destroy({
            where: {
                id: pipeline_id,
            },
        });
    }

    async getPipelines(user) {
        const pipelines = await models.pipeline.findAll({});
        const pipeline_ids = [];
        for (const pipeline of pipelines) {
            pipeline_ids.push(pipeline.id);
        }
        return pipeline_ids;
    }

    async getPipelineDetails(pipeline_id, user) {
        const pipeline = await models.pipeline.findOne({
            where: {
                id: pipeline_id,
            },
        });

        if (!pipeline) {
            throw Error(`Pipeline with id ${pipeline_id} doesn't exist.`);
        }

        const pipeline_definition = {
            id: pipeline.id,
            name: pipeline.name,
            description: pipeline.description,
            created_by: pipeline.created_by,
            jobs: [],
            pipeline_instances: [],
        };

        const jobs = await models.job.findAll({
            where: {
                pipeline_id: pipeline_definition.id,
            },
            order: [['order', 'ASC']],
        });

        for (const job of jobs) {
            const i = jobs.indexOf(job);
            pipeline_definition.jobs.push({
                id: job.id,
                name: job.name,
                description: job.description,
                tasks: [],
            });

            // eslint-disable-next-line no-await-in-loop
            const tasks = await models.task.findAll({
                where: {
                    job_id: job.id,
                },
                order: [['order', 'ASC']],
            });

            tasks.forEach((task, j) => {
                pipeline_definition.jobs[i].tasks.push({
                    id: task.id,
                    name: task.name,
                    description: task.description,
                    command_name: task.command_name,
                });
            });
        }

        const pipeline_instances = await models.pipeline_instance.findAll({
            where: {
                pipeline_id: pipeline_definition.id,
            },
        });

        for (const pipeline_instance of pipeline_instances) {
            pipeline_definition.pipeline_instances.push({
                pipeline_instance_id: pipeline_instance.id,
                status: pipeline_instance.status,
                created_at: pipeline_instance.created_at,
                modified_at: pipeline_instance.modified_at,
            });
        }

        return pipeline_definition;
    }

    async getPipelineInstanceDetails(pipeline_instance_id, user) {
        const pipeline = await models.pipeline_instance.findOne({
            where: {
                id: pipeline_instance_id,
            },
        });

        if (!pipeline) {
            throw Error(`Pipeline instance with id ${pipeline_instance_id} doesn't exist.`);
        }

        const pipeline_instance = {
            id: pipeline.id,
            status: pipeline.status,
            message: pipeline.message,
            created_at: pipeline.created_at,
            modified_at: pipeline.modified_at,
            pipeline_instance_result: pipeline.data,
            job_instances: [],
        };

        const jobs = await models.job_instance.findAll({
            where: {
                pipeline_instance_id: pipeline_instance.id,
            },
        });

        for (const job of jobs) {
            const i = jobs.indexOf(job);
            pipeline_instance.job_instances.push({
                id: job.id,
                status: job.status,
                message: job.message,
                created_at: job.created_at,
                modified_at: job.modified_at,
                task_instances: [],
            });

            // eslint-disable-next-line no-await-in-loop
            const tasks = await models.task_instance.findAll({
                where: {
                    job_instance_id: job.id,
                },
            });

            tasks.forEach((task, j) => {
                pipeline_instance.job_instances[i].task_instances.push({
                    id: task.id,
                    status: task.status,
                    message: task.message,
                    created_at: task.created_at,
                    modified_at: task.modified_at,
                });
            });
        }

        return pipeline_instance;
    }

    async triggerPipeline(pipeline_id, data, user) {
        const pipeline = await this.getPipelineDetails(pipeline_id, user);

        const commands = [];
        for (const task of pipeline.jobs[0].tasks) {
            commands.push(task.command_name);
        }

        data.pipeline_instance_id = await this.createPipelineInstance(commands[0]);

        if (!fs.existsSync(`resources/${data.pipeline_instance_id}/`)) { fs.mkdirSync(`resources/${data.pipeline_instance_id}/`); }

        const files = [];
        if (data.files) {
            for (const key of Object.keys(data.files)) {
                const fileContent = this.utilities.readFile(data.files[key].path);
                this.utilities.writeFile(`resources/${data.pipeline_instance_id}/${data.files[key].name}`, fileContent);
                files.push(`resources/${data.pipeline_instance_id}/${data.files[key].name}`);
            }
        }

        data.files = files;

        const command = this.commandResolver.resolve(commands[0]).default();
        const commandSequence = commands;
        await this.commandExecutor.add({
            name: commandSequence[0],
            sequence: commandSequence.slice(1),
            delay: command.delay,
            data,
            period: command.period,
            transactional: false,
        });


        return data.pipeline_instance_id;
    }

    async isTriggerCommand(command_name) {
        const task = await models.task.findOne({
            where: {
                command_name,
                order: 0,
            },
        });
        if (!task) { return false; }

        const job = await models.job.findOne({
            where: {
                id: task.job_id,
                order: 0,
            },
        });
        if (!job) { return false; }

        return true;
    }

    async createPipelineInstance(command_name) {
        const timestamp = Date.now();

        let task = await models.task.findOne({
            where: {
                command_name,
            },
        });

        let job = await models.job.findOne({
            where: {
                id: task.job_id,
                order: 0,
            },
        });

        const pipeline_definition = await this.getPipelineDetails(job.pipeline_id);
        const pipeline_instance_id = (await models.pipeline_instance.create({
            status: 'NOT STARTED',
            message: '',
            pipeline_id: pipeline_definition.id,
            created_at: timestamp,
            modified_at: timestamp,
        })).id;

        for (job of pipeline_definition.jobs) {
            // eslint-disable-next-line no-await-in-loop
            const job_instance_id = (await models.job_instance.create({
                status: 'NOT STARTED',
                message: '',
                job_id: job.id,
                pipeline_instance_id,
                created_at: timestamp,
                modified_at: timestamp,
            })).id;
            for (task of job.tasks) {
                // eslint-disable-next-line no-await-in-loop
                await models.task_instance.create({
                    status: 'NOT STARTED',
                    message: '',
                    task_id: task.id,
                    job_instance_id,
                    created_at: timestamp,
                    modified_at: timestamp,
                });
            }
        }

        return pipeline_instance_id;
    }

    async updateTaskInstance(pipeline_instance_id, command_name, status, message, data = {}) {
        const timestamp = Date.now();
        const task = await models.task.findOne({
            where: {
                command_name,
            },
        });
        const job = await models.job.findOne({
            where: {
                id: task.job_id,
            },
        });
        const task_instances = await models.task_instance.findAll({
            where: {
                task_id: task.id,
            },
        });

        const job_instances = await models.job_instance.findAll({
            where: {
                pipeline_instance_id,
            },
        });

        const last_task = (await models.task.findOne({
            attributes: [
                models.Sequelize.fn('MAX', models.Sequelize.col('order')),
            ],
            where: { job_id: job.id },
            raw: true,
        }))['MAX(`order`)'];

        const last_job = (await models.job.findOne({
            attributes: [
                models.Sequelize.fn('MAX', models.Sequelize.col('order')),
            ],
            where: { pipeline_id: job.pipeline_id },
            raw: true,
        }))['MAX(`order`)'];

        for (const job_instance of job_instances) {
            for (const task_instance of task_instances) {
                if (job_instance.id === task_instance.job_instance_id) {
                    // eslint-disable-next-line no-await-in-loop
                    await models.task_instance.update({
                        status,
                        message,
                        modified_at: timestamp,
                    }, {
                        where: {
                            id: task_instance.id,
                        },
                    });

                    if (task.order === 0) {
                        if (job.order === 0) {
                            // start pipeline
                            // eslint-disable-next-line no-await-in-loop
                            await models.pipeline_instance.update({
                                status,
                                message,
                                modified_at: timestamp,
                            }, {
                                where: {
                                    id: job_instance.pipeline_instance_id,
                                    status: 'NOT STARTED',
                                },
                            });
                        }
                        // start job
                        // eslint-disable-next-line no-await-in-loop
                        await models.job_instance.update({
                            status,
                            message,
                            modified_at: timestamp,
                        }, {
                            where: {
                                id: task_instance.job_instance_id,
                                status: 'NOT STARTED',
                            },
                        });
                    }

                    if (task.order === last_task) {
                        // end job
                        // eslint-disable-next-line no-await-in-loop
                        await models.job_instance.update({
                            status,
                            message,
                            modified_at: timestamp,
                        }, {
                            where: {
                                id: task_instance.job_instance_id,
                                status: 'IN PROGRESS',
                            },
                        });

                        if (job.order === last_job) {
                            // end pipeline
                            // eslint-disable-next-line no-await-in-loop
                            await models.pipeline_instance.update({
                                status,
                                message,
                                data: JSON.stringify(data),
                                modified_at: timestamp,
                            }, {
                                where: {
                                    id: job_instance.pipeline_instance_id,
                                    status: 'IN PROGRESS',
                                },
                            });
                        }
                    }
                    return;
                }
            }
        }
    }

    async setupEnvironment() {
        // await models.task.destroy({
        //     where: {},
        //     truncate: true,
        // });
        // await models.task_instance.destroy({
        //     where: {},
        //     truncate: true,
        // });
        // await models.job.destroy({
        //     where: {},
        //     truncate: true,
        // });
        // await models.job_instance.destroy({
        //     where: {},
        //     truncate: true,
        // });
        // await models.pipeline.destroy({
        //     where: {},
        //     truncate: true,
        // });
        // await models.pipeline_instance.destroy({
        //     where: {},
        //     truncate: true,
        // });
        // await models.user_role.destroy({
        //     where: {},
        //     truncate: true,
        // });
        // await models.role_pipeline.destroy({
        //     where: {},
        //     truncate: true,
        // });
        // await models.user.destroy({
        //     where: {},
        //     truncate: true,
        // });
        // await models.role.destroy({
        //     where: {},
        //     truncate: true,
        // });

        if (!fs.existsSync('resources')) {
            fs.mkdirSync('resources');
        }

        let user = await models.user.findOne({
            where: {
                email: 'demo@origin-trail.com',
            },
        });

        if (!user) {
            user = await models.user.create({
                email: 'demo@origin-trail.com',
                public_key: '',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            });

            const role = await models.role.create({
                name: 'Administrator role',
                description: 'Administrator role',
                is_admin: true,
            });

            await models.user_role.create({
                user_id: user.id,
                role_id: role.id,
            });
        }
    }
}

module.exports = DataPipelineService;
