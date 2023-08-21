import { MongoBaseDto } from "./base/mongo-base-dto";
import { jsonMember, jsonObject } from "typedjson";

@jsonObject
class DeploymentPackageDto {
  @jsonMember({isRequired: true}) public isMandatory!: boolean;
  @jsonMember({isRequired: true}) public isDisabled!: boolean;
  @jsonMember({isRequired: true}) public rollout!: number;
  @jsonMember({isRequired: true}) public appVersion!: string;
  @jsonMember({isRequired: true}) public uploadTime!: number;
  @jsonMember public originalDeployment?: string;
  @jsonMember public releasedBy?: string;
  @jsonMember public releaseMethod?: string;
  @jsonMember public label?: string;
  @jsonMember public description?: string;
  @jsonMember public packageHash?: string;
  @jsonMember public size?: number;
}

@jsonObject
export class DeploymentDto {
  @jsonMember({isRequired: true}) public name!: string;
  @jsonMember({isRequired: true}) public key!: string;
  @jsonMember({isRequired: true}) public package!: DeploymentPackageDto;
}
