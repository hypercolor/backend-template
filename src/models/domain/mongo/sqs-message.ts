import {jsonMember, jsonObject} from 'typedjson';
import { MongoDomainObject } from '../base/mongo-domain-object';

@jsonObject
export class SqsMessage extends MongoDomainObject {
  @jsonMember({isRequired: true}) public queueUrl!: string;
  @jsonMember public awsMessageId?: string;
  @jsonMember({isRequired: true}) public type!: string;
  @jsonMember({isRequired: true}) public parameters!: any;
  @jsonMember({isRequired: true}) public sender!: string;
}
