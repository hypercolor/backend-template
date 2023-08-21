import {isDate} from 'moment';
import moment from 'moment';
import {InvalidParameterError} from './errors';
import {ObjectId} from 'mongodb';
import { CodePushDeploymentName } from '@hypercolor/code-push/src/enums/code-push-deployment-name';
import { CodePushOs } from '@hypercolor/code-push';


export interface ICustomStringParams {
    minLength?: number
    required?: boolean
    trim?: boolean
    lowercase?: boolean
}

// we use this because if you just plug in parseInt, it has weird behavior:
// '1,2,3'.split(',').map(parseInt)           => [1, undefined, undefined]
// '1,2,3'.split(',').map(v => parseInt(v))   => [1,2,3]
function wrappedParseInt(v: any) {
    return parseInt(v);
}

export class Deserializers {

    public static parseCodePushEnvironment(value: any) {
        if (typeof value !== 'string') {
            throw new Error('CodePushDeployment name must be a string');
        }
        return value.charAt(0).toUpperCase() + value.slice(1) as CodePushDeploymentName;
    }

    public static parseCodePushOs(value: any): CodePushOs {
        if (typeof value !== 'string') {
            throw new Error('CodePushDeployment name must be a string');
        }
        let indexMatch = -1;
        Object.keys(CodePushOs).map((key, index) => {
            if (key.toLowerCase() === value.toLowerCase()) {
                indexMatch = index;
            }
        });
        if (indexMatch === -1) {
            throw new Error('Invalid OS');
        }
        return Object.values(CodePushOs)[indexMatch] as CodePushOs;
    }

    public static parseStringToObjectId(_id?: string) {
        return _id ? new ObjectId(_id) : undefined;
    }
    public static parseObjectId(_id?: ObjectId) {
        return _id ? _id.toString() : undefined;
    }

    public static parseStringToObjectIdArray(_ids?: string[]) {
        return _ids && _ids.length > 0 ? _ids.map(_id => new ObjectId(_id)) : [];
    }

    public static parseObjectIdArray(_ids?: ObjectId[]) {
        return _ids && _ids.length > 0 ? _ids.map(_id => _id.toString()) : [];
    }

    public static toString(value: any) {
        return value ? value.toString() : undefined;
    }

    public static customString(params: ICustomStringParams) {
        return (value: string) => {
            if (!value) {
                if (params.required) {
                    throw {code: 422, error: 'Expected a value'};
                } else {
                    return value;
                }
            } else {
                if (!value || value.constructor !== String) {
                    console.log('expected string, got ', value.constructor.name);
                    throw {code: 422, error: 'Expected string type'};
                }
                if (params.minLength && value.length < params.minLength) {
                    throw {code: 422, error: 'Value length ' + value.length + ' less than minimum length required: ' + params.minLength};
                }
                if (params.trim) {
                    value = value.trim();
                }
                if (params.lowercase) {
                    value = value.toLowerCase();
                }
                return value;
            }
        };
    }

    public static date(date: any): Date {
        if (!date) {
            return date;
        }
        if (isDate(date)) {
            return date;
        } else {
            return moment(date).toDate();
        }
    }

    public static numeric(defaultValue?: number) {
        return (value: any) => {
            if (value) {
                if (isNaN(parseInt(value))) {
                    throw new InvalidParameterError('Invalid int: ' + value);
                }
                return parseInt(value);
            } else {
                return defaultValue !== undefined ? defaultValue : undefined;
            }
        };
    }

    public static floatRequired(value: any) {
        if (isNaN(parseFloat(value))) {
            throw new InvalidParameterError('Invalid float: ' + value);
        }
        return parseFloat(value);
    }

    public static boolean(value: any) {
        if (!value) {
            return false;
        } else {
            return value === 1 || value === 'true' || value === 'Y' || value === '1';
        }
    }

    public static booleanOptional(value: any) {
        if (value !== null && value !== undefined) {
            return Deserializers.boolean(value);
        } else {
            return undefined;
        }
    }

    public static parseInt(value: any) {
        return parseInt(value);
    }

    public static parseIntOptional(value: any) {
        if (value) {
            return parseInt(value);
        } else {
            return value;
        }
    }
}
