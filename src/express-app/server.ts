import express from 'express';
import * as http from 'http';
import {Routes} from '../routes/routes';
import {Config} from '../util/config';
import {Logger} from "../util/logger";
import {Middleware} from './middleware';
import {MorganLogger} from './morgan-logger';
import { Driver } from '@hypercolor/mongodb-orm/src/driver';
import { DatabaseManager } from '../managers/database-manager';


export class Server {
    public app: express.Application;
    private httpServer: http.Server | null = null;

    constructor() {
        this.app = express();
        MorganLogger.registerMorganLoggerMiddleware(this.app);
        Middleware.registerCompressionMiddleware(this.app);
        Middleware.registerPreRouteMiddleware(this.app);
        Routes.register(this.app);
    }

    public async start() {
        await DatabaseManager.connect();
        await new Driver({
            uri: Config.MONGODB_URL,
            databaseName: Config.MONGODB_DATABASE_NAME,
        }).connect();
        await this.startHttp();
    }

    private async startHttp() {
        return new Promise<void>((resolve, reject) => {
            this.httpServer = http.createServer(this.app);
            this.httpServer.listen(normalizePort(Config.PORT));
            this.httpServer.on('error', (error: any) => {
                if (error.syscall !== 'listen') {
                    throw error;
                }
                switch (error.code) {
                    case 'EACCES':
                        Logger.error('Server', 'Requires elevated privileges');
                        process.exit(1);
                        break;
                    case 'EADDRINUSE':
                        Logger.error('Server', 'Address is already in use');
                        process.exit(1);
                        break;
                    default:
                        throw error;
                }
                reject(error);
            });
            this.httpServer.on('listening', () => {
                if (this.httpServer) {
                    const addr = this.httpServer.address() as any;
                    Logger.log('Server', 'Server running at ' + Config.ServerUrl + ':' + addr.port);
                    resolve();
                }
            });
        });
    }
}

/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = (val: string) => {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
};
