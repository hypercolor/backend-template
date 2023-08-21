import { optionalBooleanEnv, optionalEnv, optionalIntEnv, optionalStringEnv, requiredEnv } from '@hypercolor/envconfig';
import { Logger } from './logger';

export class Config {
  // Required .env vars
  @requiredEnv public static APP_NAME: string;
  @requiredEnv public static DATABASE_URL: string;
  @requiredEnv public static ENVIRONMENT_NAME: string;
  @requiredEnv public static MONGODB_DATABASE_NAME: string;
  @requiredEnv public static MONGODB_URL: string;
  @requiredEnv public static SQS_URL_ASYNC_WORKER: string;

  @optionalEnv public static AWS_ACCESS_KEY_ID?: string;
  @optionalEnv public static AWS_SECRET_ACCESS_KEY?: string;
  @optionalEnv public static AWS_DEFAULT_REGION?: string;

  @optionalEnv public static REDIS_URL?: string;
  @optionalEnv public static REDIS_HOSTNAME?: string;
  @optionalEnv public static REDIS_USERNAME?: string;
  @optionalEnv public static REDIS_PASSWORD?: string;

  @optionalBooleanEnv public static INSTRUMENT_ERROR_REQUEST_BODIES: boolean;
  @optionalBooleanEnv public static INSTRUMENT_ERRORS_500: boolean;
  @optionalBooleanEnv public static INSTRUMENT_ERRORS_ALL: boolean;
  @optionalBooleanEnv public static INSTRUMENT_EACH_REQUEST: boolean;

  @optionalBooleanEnv public static RATE_LIMIT_SHOW_HEADERS: boolean;
  @optionalBooleanEnv public static USE_RATE_LIMITER: boolean;
  @optionalBooleanEnv public static USE_REDIS_RATE_LIMITER: boolean;
  @optionalBooleanEnv public static WORKER_VERBOSE: boolean;

  @optionalIntEnv(100) public static DATABASE_CONNECTION_POOL_SIZE: number;
  @optionalIntEnv(5000) public static RATE_LIMIT_MAX_REQUESTS_PER_DAY: number;
  @optionalIntEnv(10000) public static REDIS_CACHE_DURATION_MS: number;
  @optionalIntEnv(3600 * 2) public static SQS_VISIBILITY_TIMEOUT_SECONDS: number;
  @optionalIntEnv(1) public static WORKER_CONCURRENCY: number;

  @optionalStringEnv('3000') public static PORT: string;

  public static DEBUG = new Set((process.env.DEBUG || '').split(' '));

  public static ServerUrl =
    (process.env.SERVER_DOMAIN === 'localhost' ? 'http' : 'https') + '://' + process.env.SERVER_DOMAIN;

  public static TYPEORM_LOGGING: string | undefined =
      process.env.TYPEORM_LOGGING === 'none'
          ? undefined
          : process.env.TYPEORM_LOGGING;

  public static get RedisUrl () {
    if (Config.REDIS_URL) {
      return Config.REDIS_URL;
    } else if (Config.REDIS_HOSTNAME && Config.REDIS_USERNAME && Config.REDIS_PASSWORD) {
      return `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOSTNAME}:6379`;
    } else {
      if (process.env.TEST) {
        return 'redis://localhost:6379';
      }
      Logger.log('Failed to load redis creds: ', Config.REDIS_URL, ',', Config.REDIS_HOSTNAME, ',', Config.REDIS_USERNAME, ',', Config.REDIS_PASSWORD);
      throw new Error('Redis URL or hostname, username, and password must be set.');
    }
  }

  public static get isProduction() {
    return this.ENVIRONMENT_NAME === 'production'
  }
}
