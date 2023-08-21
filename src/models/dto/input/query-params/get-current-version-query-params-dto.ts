import { jsonMember, jsonObject } from 'typedjson';
import { Deserializers } from '../../../../util/deserializers';
import { CodePushDeploymentName } from '@hypercolor/code-push/src/enums/code-push-deployment-name';
import { CodePushOs } from '@hypercolor/code-push';

@jsonObject
export class GetCurrentVersionQueryParamsDto {
  @jsonMember({isRequired: true, deserializer: Deserializers.parseCodePushEnvironment}) public environment!: CodePushDeploymentName;
  @jsonMember({isRequired: true, deserializer: Deserializers.parseCodePushOs}) public os!: CodePushOs;
}
