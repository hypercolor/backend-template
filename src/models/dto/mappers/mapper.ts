import {TypedJSON} from 'typedjson';
import {InternalServerError, IDomainErrorClass, UnprocessableEntityError} from '../../../util/errors';
import { PaginationQueryParamsDto } from "../input/query-params/pagination-query-params-dto";

export type IMappedClass<T> = new(...args: Array<any>) => T;

export interface IMappedPaginatedResponse<T> {
    meta: {
        count: number,
        page: number,
        pageSize: number
    },
    items: Array<T>
}

export class Mapper {

    public static mapInput<T>(json: any, clazz: IMappedClass<T>): T {
        return this.map(json, clazz, UnprocessableEntityError);
    }

    public static mapOutput<T>(json: any, clazz: IMappedClass<T>): T {
        return this.map(json, clazz, InternalServerError);
    }

    public static mapInputArray<T>(json: any, clazz: IMappedClass<T>): Array<T> {
        return this.mapArray(json, clazz, UnprocessableEntityError);
    }

    public static mapOutputArray<T>(json: any, clazz: IMappedClass<T>): Array<T> {
        return this.mapArray(json, clazz, InternalServerError);
    }

    public static mapPaginatedOutput<T>(json: any, pagination: PaginationQueryParamsDto, clazz: IMappedClass<T>): IMappedPaginatedResponse<T> {
        return {
            meta: {
                count: json.length,
                page: pagination.page,
                pageSize: pagination.pageSize
            },
            items: this.mapArray(json, clazz, InternalServerError)
        };
    }

    private static map<T>(json: any, clazz: IMappedClass<T>, errorClass: IDomainErrorClass): T {
        if (!json) {
            throw new errorClass('Failed to map null or undefined object');
        }
        const serializer = new TypedJSON(clazz as any, {errorHandler: (err: Error) => { throw err; }});
        try {
            if (json.toJSON) {
                // console.log('toJSON function found, calling it');
                json = json.toJSON();
            }
            // console.log('Mapping to ' + clazz + ': ' + JSON.stringify(json, null, 2));
            return serializer.parse(json) as T;
        } catch (err) {
            throw new errorClass('Failed to map: ' + this.buildMessage(err));
        }
    }

    private static mapArray<T>(json: any, clazz: IMappedClass<T>, errorClass: IDomainErrorClass): Array<T> {
        if (!json) {
            throw new errorClass('Failed to map null or undefined array');
        }
        if (json.constructor !== Array) {
            throw new errorClass('Expected array, found ' + json.constructor.name);
        }
        return json.map(item => this.map(item, clazz, errorClass));
        // const serializer = new TypedJSON(clazz as any, {errorHandler: (err: Error) => { throw err; }});
        // try {
        //     return json.map((item: any) => serializer.parse(item) as T);
        // } catch (err) {
        //     throw new errorClass('Failed to map: ' + this.buildMessage(err));
        // }
    }

    private static buildMessage(err: any) {
        const localeString = err.toLocaleString ? err.toLocaleString() : '';
        if (typeof localeString === 'string') {
            return localeString;
        } else {
            return JSON.stringify(err);
        }
    }
}
