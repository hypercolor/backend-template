import { jsonMember, jsonObject } from 'typedjson';
import { MongoDomainObject } from '../base/mongo-domain-object';

@jsonObject
export class ApiRequest extends MongoDomainObject {
  @jsonMember({isRequired: true}) public app!: string;
  @jsonMember({isRequired: true}) public ipAddress!: string;
  @jsonMember({isRequired: true}) public isError!: boolean;
  @jsonMember({isRequired: true}) public method!: string;
  @jsonMember({isRequired: true}) public path!: string;
  @jsonMember({isRequired: true}) public requestBytes!: number;
  @jsonMember({isRequired: true}) public responseStatus!: number;
  @jsonMember public error?: any;
  @jsonMember public stack?: any;
  @jsonMember public meta?: any;
  @jsonMember public body?: any;
  @jsonMember public response?: any;
}
