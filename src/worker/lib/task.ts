import { Credentials } from 'aws-sdk';
import SQS from 'aws-sdk/clients/sqs';
import {SqsMessage} from '../../models/domain/mongo/sqs-message';
import {Mapper} from '../../models/dto/mappers/mapper';
import {Config} from '../../util/config';
import {ISqsSubmitterConfig, ITaskResult} from './sqs-worker-types';

export abstract class Task {
  public static workerConfig: ISqsSubmitterConfig;

  public abstract run(): Promise<ITaskResult | void>;

  public static build<T = Task>(this: new() => T, parameters?: { [key in keyof T]?: any }) {
    return Mapper.mapInput(parameters || {}, this);
  }

  public isRetryable = true;

  public async submit() {
    const config: ISqsSubmitterConfig = (this.constructor as any).workerConfig;
    if (!config) {
      return Promise.reject(
        new Error(
          'Worker config not set for task ' + this.constructor.name + ', was it registered with a SqsWorkerSubmitter?'
        )
      );
    } else {
      const params = {
        type: this.constructor.name,
        parameters: this,
      };
      const accessKeyId = config.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = config.accessKeyId || process.env.AWS_SECRET_ACCESS_KEY;
      const region = config.region || process.env.AWS_DEFAULT_REGION;
      const credentials = accessKeyId && secretAccessKey ? new Credentials(accessKeyId, secretAccessKey) : undefined;

      const record = await SqsMessage.create({
        type: params.type,
        parameters: params.parameters,
        queueUrl: config.sqsUrl,
        sender: Config.APP_NAME,
      });

      (params as any).messageId = record._id.toString();

      return new SQS({
        credentials,
        region,
      })
        .sendMessage({
          DelaySeconds: 0,
          MessageAttributes: {
            type: {
              DataType: 'String',
              StringValue: this.constructor.name,
            },
          },
          MessageBody: JSON.stringify(params),
          QueueUrl: config.sqsUrl,
        })
        .promise();
    }
  }
}
