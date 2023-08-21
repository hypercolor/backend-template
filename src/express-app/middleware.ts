/**
 * @module Middleware
 * @type {*|exports|module.exports}
 */

import bodyParser = require('body-parser');
import compression = require('compression');
import cors from 'cors';
import {Application, NextFunction, Request, Response} from 'express';
import {Responses} from '../routes/classes/responses';
import {InvalidParameterError, UnprocessableEntityError} from '../util/errors';
import {Logger} from '../util/logger';
import { Config } from '../util/config';
import os from 'os';
import RateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import multer from 'multer';
import { HerokuUtil } from '../util/heroku-util';
import { ApiLoggingService } from '../services/api-logging-service';

const upload = multer({ dest: os.tmpdir() });

export interface IRateLimiterConfig {
    max?: number
    windowMs?: number
}

export class Middleware {
    public static rateLimiter(config?: IRateLimiterConfig) {
        return RateLimit({
            store: Config.USE_REDIS_RATE_LIMITER ? new RedisStore({
                redisURL: Config.REDIS_URL
            }) : undefined,
            max: config && config.max ? config.max : Config.RATE_LIMIT_MAX_REQUESTS_PER_DAY, // Default: limit each IP to 50 requests per windowMs
            windowMs: config && config.windowMs ? config.windowMs : 24 * 3600 * 1000, // Default: 24 hour window
            headers: Config.RATE_LIMIT_SHOW_HEADERS,
            keyGenerator: (req: Request) => {
                return HerokuUtil.getIpAddress(req);
            },
            onLimitReached: (req: Request, res: Response, options: any) => {
                Logger.warn('WARNING: User hit rate limit: ', HerokuUtil.getIpAddress(req));
                ApiLoggingService.logApiRequest(req, 429);
            }
        });
    }

    public static registerPreRouteMiddleware(expressApp: Application) {
        /**
         * Permissive CORS
         */
        expressApp.use(cors() as any);
        expressApp.options('*', cors() as any); // include before other routes

        /**
         * BODY PARSING MIDDLEWARE
         */
        expressApp.use((req: Request, res: Response, next: NextFunction) => {
            const contentType = req.headers['content-type'];
            if (req.method === 'GET') {
                // No body parsing required for GET requests
                next();
            } else if (req.method === 'DELETE' && contentType === undefined) {
                // Delete request with no content-type specified, don't parse a body
                next();
            } else if (req.headers['content-length'] === '0') {
                next();
            } else if (contentType === undefined) {
                Responses.sendErrorResponse(req, res, new InvalidParameterError('Content-Type header not found, but content-length was ' + req.headers['content-length']));
            } else if (contentType.indexOf('multipart/form-data') > -1) {
                upload.single('csv')(req, res, next);
                // Responses.sendErrorResponse(req, res, 'BodyParsingMiddleware')(({code: 400, error: 'multipart/form-data not allowed for route: ' + req.url }));
            } else if (contentType.indexOf('application/json') > -1) {
                bodyParser.json({limit: '200mb'})(req, res, next);
            } else {
                Responses.sendErrorResponse(req, res, new InvalidParameterError('Unsupported Content-Type: ' + req.headers['content-type']));

            }
        });

        /**
         * Middleware for handling bad requests e.g. malformed JSON
         */
        expressApp.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            Logger.error('BadRequest', 'error bad request: ' + err);
            Responses.sendErrorResponse(req, res, new UnprocessableEntityError('Bad request:  ' + err));
        });
    }

    public static registerCompressionMiddleware(app: Application) {
        app.use(compression());
    }
}
