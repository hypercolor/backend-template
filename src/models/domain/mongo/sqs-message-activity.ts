import {jsonMember, jsonObject} from 'typedjson';
import { MongoDomainObject } from '../base/mongo-domain-object';

@jsonObject
export class SqsMessageActivity extends MongoDomainObject {
  @jsonMember({isRequired: true}) public messageId!: string;
  @jsonMember({isRequired: true}) public type!: string;
  @jsonMember({isRequired: true}) public app!: string;
  @jsonMember public durationMs?: number;
  @jsonMember public error?: any;
  @jsonMember public errorRetryable?: boolean;
}
