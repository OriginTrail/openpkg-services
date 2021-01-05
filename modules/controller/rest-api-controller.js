const ip = require('ip');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const pjson = require('../../package.json');
const sortedStringify = require('sorted-json-stringify');
const passport = require('passport');
const { Strategy } = require('passport-http-bearer');
const models = require('../../database/models');
const AuthUtilities = require('../utilities/authentication-utilities');

const RestApiService = require('../services/rest-api-service');

class RestApiController {
    constructor(ctx) {
        this.ctx = ctx;
        this.config = ctx.config;
        this.logger = ctx.logger;

        this.restApis = [new RestApiService(ctx, true)];
        [this.defaultRestApi] = this.restApis;
    }

    async startRPC() {
        const options = {
            name: 'RPC server',
            version: pjson.version,
            formatters: {
                'application/json': (req, res, body) => {
                    res.set('content-type', 'application/json; charset=utf-8');
                    if (!body) {
                        if (res.getHeader('Content-Length') === undefined && res.contentLength === undefined) {
                            res.setHeader('Content-Length', 0);
                        }
                        return null;
                    }

                    if (body instanceof Error) {
                        // snoop for RestError or HttpError, but don't rely on instanceof
                        if ((body.restCode || body.httpCode) && body.body) {
                            // eslint-disable-next-line
                            body = body.body;
                        } else {
                            body = {
                                message: body.message,
                            };
                        }
                    }

                    if (Buffer.isBuffer(body)) {
                        body = body.toString('base64');
                    }

                    let ident = 2;
                    if ('prettify-json' in req.headers) {
                        if (req.headers['prettify-json'] === 'false') {
                            ident = 0;
                        }
                    }

                    const data = sortedStringify(body, null, ident);

                    if (res.getHeader('Content-Length') === undefined && res.contentLength === undefined) {
                        res.setHeader('Content-Length', Buffer.byteLength(data));
                    }
                    return data;
                },
            },
        };

        const server = restify.createServer(options);

        const parseLatest = (req, res, next) => {
            req.url = req.url.replace(/(\/api\/)latest(\/.+)/, `$1${this.ctx.config.latest_api_version}$2`);
            next();
        };

        server.use(restify.plugins.acceptParser(server.acceptable));
        server.use(restify.plugins.queryParser());
        server.use(restify.plugins.bodyParser({
            maxBodySize: 10 * 1024 * 1024 * 1024,
            maxFileSize: 10 * 1024 * 1024 * 1024,
        }));
        server.pre(parseLatest);
        const cors = corsMiddleware({
            preflightMaxAge: 5, // Optional
            origins: ['*'],
            allowHeaders: ['API-Token', 'prettify-json', 'raw-data'],
            exposeHeaders: ['API-Token-Expiry'],
        });

        server.pre(cors.preflight);
        server.use(cors.actual);
        server.use((request, response, next) => {
            const request_ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
            if (AuthUtilities.validateIPAddress(request_ip, this.config.remote_whitelist)) {
                return next();
            }
            response.status(403);
            response.send({
                message: 'Forbidden request',
            });
        });

        passport.use(new Strategy(async (token, done) => {
            // todo this code snippet can be replaced with signature verification
            const user = await AuthUtilities.validateToken(models.user, token);
            if (!user) {
                return done(null, false);
            }
            return done(null, user, { scope: 'all' });
        }));


        // TODO: Temp solution to listen all adapters in local net.
        let serverListenAddress = this.config.node_rpc_ip;
        if (ip.isLoopback(serverListenAddress)) {
            serverListenAddress = '0.0.0.0';
        }

        // promisified server.listen()
        const startServer = () => new Promise((resolve, reject) => {
            server.listen(this.config.node_rpc_port, serverListenAddress, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await startServer(server, serverListenAddress);
        this.logger.notify(`API exposed at  ${server.url}`);

        this.restApis.forEach(restApi => restApi._exposeAPIRoutes(server, passport));
    }
}

module.exports = RestApiController;
