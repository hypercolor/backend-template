import {Application} from 'express';
import morgan from 'morgan';
import {Writable} from 'stream';
import {Config} from '../util/config';
import {Keygen} from '../util/keygen';
import {Logger} from '../util/logger';

export class MorganLogger {
    public static registerMorganLoggerMiddleware(app: Application) {
        app.use(
            morgan(':method :url :status :res[content-length] :response-time ms', {
                stream: new Writable({
                    write(chunk: any, encoding: any, callback: any) {
                        if (Config.INSTRUMENT_EACH_REQUEST) {
                            const logData = chunk.toString().trim();
                            if (!logData.startsWith('OPTIONS')) {
                                Logger.log('id=' + Keygen.hexUid(8), logData);
                            }
                        }
                        callback();
                    },
                }),
            }),
        );
    }
}
