import "reflect-metadata";
import { jsonMember, jsonObject } from "typedjson";
import { Deserializers } from "../../../../util/deserializers";
import { EntityStatus } from "../../../enums/entity-status";

@jsonObject
export class MongoBaseDto {
  @jsonMember({ isRequired: true, deserializer: Deserializers.parseObjectId }) public _id!: string;
  @jsonMember({ isRequired: true }) public createdAt!: Date;
  @jsonMember public updatedAt?: Date;
  @jsonMember({ isRequired: true }) public status!: EntityStatus;
}
