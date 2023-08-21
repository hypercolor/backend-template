import { jsonMember, jsonObject } from 'typedjson';
import { CodePushDeploymentName } from '@hypercolor/code-push/src/enums/code-push-deployment-name';
import { CodePushOs } from '@hypercolor/code-push';

@jsonObject
export class CreateNewVersionRequestDto {
  @jsonMember({isRequired: true}) public environment!: CodePushDeploymentName;
  @jsonMember({isRequired: true}) public os!: CodePushOs;
  @jsonMember({isRequired: true}) public isMandatory!: boolean;
  @jsonMember public version?: string;
  @jsonMember public isDisabled?: boolean; //staged or active immediately, can activate later, defaults to false
  @jsonMember public description?: string;
}
