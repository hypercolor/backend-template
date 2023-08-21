import 'reflect-metadata';
import {Config} from '../util/config';
import {DataSource} from 'typeorm';
import {SnakeNamingStrategy} from 'typeorm-naming-strategies';
import {DatabaseRegistry} from '../models/domain/database-registry';
import {Logger} from '../util/logger';

export class DatabaseManager {
    public static get dataSource() {
        if (!this._dataSource) {
            throw new Error('DataSource not inititalized');
        }
        return this._dataSource;
    }
    private static _dataSource = new DataSource({
        type: 'postgres',
        url: Config.DATABASE_URL,
        ssl: Config.ENVIRONMENT_NAME === 'localhost' ? false : {
            rejectUnauthorized: false
        },
        schema: 'abuzz',
        synchronize: false,
        entities: DatabaseRegistry.allObjects(),
        namingStrategy: new SnakeNamingStrategy(),
        logging: Config.TYPEORM_LOGGING as any,
        extra: {
            connectionLimit: Config.DATABASE_CONNECTION_POOL_SIZE,
            timezone:'utc'
        }
    });

    public static async connect(poolSize?: number) {
        if (Config.TYPEORM_LOGGING) {
            Logger.log('Database', 'DB Log level: ' + JSON.stringify(Config.TYPEORM_LOGGING));
        }
        this._dataSource = await this._dataSource.initialize();
    }
}
