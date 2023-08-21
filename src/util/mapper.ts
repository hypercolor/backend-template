import { DomainError } from './errors';
import { TypedJSON } from 'typedjson';
import { Logger } from './logger';
import { PasswordUtil } from './password-util';

export type IMappedClass<T> = new(...args: Array<any>) => T;

export interface IMappedPaginatedResponse<T> {
    meta: {
        count: number,
        total?: number,
        page: number,
        pageSize: number
    },
    items: Array<T>
}

export interface IPaginatedMeta {
    count: number,
    total: number,
    page: number,
    pageSize: number,
    verbose: boolean
}

export class Mapper {

    public static mapInput<T>(json: any, clazz: IMappedClass<T>): T {
        return this.map(json, clazz, 422);
    }

    public static mapOutput<T>(json: any, clazz: IMappedClass<T>): T {
        return this.map(json, clazz, 500);
    }

    public static mapInputArray<T>(json: any, clazz: IMappedClass<T>): Array<T> {
        return this.mapArray(json, clazz, 422);
    }

    public static mapOutputArray<T>(json: any, clazz: IMappedClass<T>): Array<T> {
        return this.mapArray(json, clazz, 500);
    }

    public static mapPaginatedOutput<T>(json: any, meta: IPaginatedMeta, clazz: IMappedClass<T>): IMappedPaginatedResponse<T> {
        return {
            meta,
            items: this.mapArray(json, clazz, 422)
        };
    }

    private static map<T>(json: any, clazz: IMappedClass<T>, errorCode: number): T {
        if (!json) {
            throw new DomainError(errorCode, 'Failed to map null or undefined object');
        }
        const serializer = new TypedJSON(clazz as any, {errorHandler: (err: Error) => { throw err; }});
        try {
            if (json.toJSON) {
                 Logger.log('toJSON function found, calling it');
                 json = json.toJSON();
            }
            // Logger.log('Mapping to ' + clazz + ': ' + JSON.stringify(json, null, 2));
            return serializer.parse(json) as T;
        } catch (err: any) {
            Logger.log(err.stack);
            Logger.log('Failed to map object: ' + JSON.stringify(PasswordUtil.stripPasswordsFromObject(json)));
            throw new DomainError(errorCode, 'Failed to map: ' + PasswordUtil.stripPasswordsFromObject(err).toLocaleString());
        }
    }

    private static mapArray<T>(json: any, clazz: IMappedClass<T>, errorCode: number): Array<T> {
        if (!json) {
            throw new DomainError(errorCode, 'Failed to map null or undefined array');
        }
        if (json.constructor !== Array) {
            throw new DomainError(errorCode, 'Expected array, found ' + json.constructor.name);
        }
        const serializer = new TypedJSON(clazz as any, {errorHandler: (err: Error) => { throw err; }});
        try {
            return json.map((item: any) => serializer.parse(item) as T);
        } catch (err: any) {
            throw new DomainError(errorCode, 'Failed to map: ' + PasswordUtil.stripPasswordsFromObject(err).toLocaleString());
        }
    }
}
