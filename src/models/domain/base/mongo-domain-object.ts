import {jsonMember, jsonObject} from 'typedjson';
import 'reflect-metadata';
import {ObjectId} from 'mongodb';
import { EntityStatus, QueryOperators } from '@hypercolor/mongodb-orm';
import { Config } from '../../../util/config';

@jsonObject
export class MongoDomainObject extends QueryOperators {
  constructor() {
    super({
      uri: Config.MONGODB_URL,
      databaseName: Config.MONGODB_DATABASE_NAME,
    });
  }

  @jsonMember({isRequired: true}) public _id!: ObjectId;
  @jsonMember({isRequired: true}) public createdAt!: Date;
  @jsonMember public updatedAt?: Date;
  @jsonMember({isRequired: true}) public status!: EntityStatus;
}
