import {Credentials} from 'aws-sdk';
import * as https from 'https';
import {Consumer} from 'sqs-consumer';
import {SqsMessageActivityService} from '../../services/sqs-message-activity-service';
import {ISqsConsumerConfig} from './sqs-worker-types';
import {TaskFactory} from './task-factory';
import {Config} from "../../util/config";
import {Logger} from "../../util/logger";
import { Message, SQSClient } from '@aws-sdk/client-sqs';
const MD5 = require('md5');

export class SqsWorkerConsumer {

  private consumer: Consumer;

  constructor(public config: ISqsConsumerConfig) {
    const accessKeyId = config.accessKeyId || Config.AWS_ACCESS_KEY_ID;
    const secretAccessKey = config.accessKeyId || Config.AWS_SECRET_ACCESS_KEY;
    const region = config.region || Config.AWS_DEFAULT_REGION;
    let credentials;
    if (accessKeyId && secretAccessKey) {
      credentials = new Credentials(accessKeyId, secretAccessKey);
    }

    const sqs = new SQSClient([{
      region,
      credentials,
      httpOptions: {
        agent: new https.Agent({
          keepAlive: true
        })
      }
    }]);

    this.consumer = Consumer.create({
      queueUrl: config.sqsUrl,
      handleMessage: this.messageHandler(),
      pollingWaitTimeMs: 1000,
      sqs,
      // sqs: new SQS({
      //   httpOptions: {
      //     agent: new https.Agent({
      //       keepAlive: true
      //     })
      //   },
      //   credentials,
      //   region
      // }),
      messageAttributeNames: ['type'],
      // terminateVisibilityTimeout: true,  // if task fails, allow it to be immediately retried instead of waiting to end of visibility timeout
      visibilityTimeout: Config.SQS_VISIBILITY_TIMEOUT_SECONDS,
      heartbeatInterval: 15, // sqs default timeout is 30 sec, so refresh lock on message every 15 sec
      handleMessageTimeout: 2 * 3600 * 1000 // sqs global timeout
    });

    this.consumer.on('error', err => {
      if (!this.config || this.config.verbose) {
        Logger.error('SqsWorkerConsumer: There was an error in the sqs task');
        Logger.error(err);
        Logger.error(err.stack);
      }
    });
    this.consumer.on('processing_error', err => {
      if (!this.config || this.config.verbose) {
        Logger.error('SqsWorkerConsumer: There was a processing_error in the sqs task');
        Logger.error(err);
        Logger.error(err.stack);
      }
    });
  }

  public async start() {
    return this.consumer.start();
  }

  private log(message: string) {
    if (this.config.verbose) {
      Logger.log(this.config.id + ': ' + message);
    }
  }

  // If this handler throws an exception, the message will not be deleted from the queue and will be retried
  private messageHandler() {
    return async(message: Message) => {
      const start = new Date();
      if (!message.Body) {
        this.log('Invalid message, no body: ' + JSON.stringify(message));
        return;
      }
      const md5OfBody = MD5(message.Body);
      if (md5OfBody !== message.MD5OfBody) {
        this.log('Invalid message, md5 mismatch: ' + md5OfBody + ' != ' + message.MD5OfBody + ', body was: ' + message.Body);
        return;
      }
      const body = JSON.parse(message.Body);
      if (!body.type || typeof body.type !== 'string') {
        this.log('Invalid message, message type not found or recognized: ' + JSON.stringify(message));
        return;
      }
      await SqsMessageActivityService.recordMessageReceived(body, this.config.sqsUrl);
      const task = await this.parseTask(body);
      if (!task) {
        return;
      }
      try {

        const receiveCount = parseInt(message.Attributes?.ApproximateReceiveCount || '1');
        const firstSent = new Date(parseInt(message.Attributes?.SentTimestamp || new Date().getTime().toString()));

        this.log('Starting task: ' + task.constructor.name + ' from message: ' + message.MessageId + ' - ' + message.Body);

        if (!isNaN(receiveCount) && receiveCount > 1) {
          const elapsedSeconds = (new Date().getTime() - firstSent.getTime()) / 1000;
          this.log('This message has now been received ' + receiveCount + ' times, it was first sent ' + elapsedSeconds + ' seconds ago.');
          this.log('Full message: ' + JSON.stringify(message));
        }

        const result = await task.run();

        // const result = await task.run();
        if (result && result.error) {
          await SqsMessageActivityService.recordMessageError(body, new Date().getTime() - start.getTime(), result.error);
          this.log(`Job ${SqsWorkerConsumer.parseMessageType(message)} [${message.MessageId}] failed (not retryable): ${result.error}`);
          this.config.failCallback && this.config.failCallback(SqsWorkerConsumer.parseMessageType(message), result.error);
        } else {
          await SqsMessageActivityService.recordMessageProcessed(body, new Date().getTime() - start.getTime());
          this.log(`${task.constructor.name} [${message.MessageId}] complete in ${SqsWorkerConsumer.getDuration(start)}${result && result.info ? ': ' + result.info : ''}`);
          this.config.successCallback && this.config.successCallback(task, {
            durationMs: new Date().getTime() - start.getTime(),
            taskResult: result,
          });
        }
      } catch (err) {

        if (task.isRetryable) {
          await SqsMessageActivityService.recordMessageErrorRetryable(body, new Date().getTime() - start.getTime(), err);
          this.log(`Job ${SqsWorkerConsumer.parseMessageType(message)} [${message.MessageId}] threw error (retryable): ${err}`);
          this.config.failCallback && this.config.failCallback(SqsWorkerConsumer.parseMessageType(message), err);
          throw err;
        } else {
          await SqsMessageActivityService.recordMessageError(body, new Date().getTime() - start.getTime(), err);
          this.log(`Job ${SqsWorkerConsumer.parseMessageType(message)} [${message.MessageId}] threw error (task not retryable): ${err}`);
          this.config.failCallback && this.config.failCallback(SqsWorkerConsumer.parseMessageType(message), err);
        }
      }
    };
  }

  private async parseTask(body: any) {
    return TaskFactory.build(body.type, body.parameters, this.config.verbose)
    .catch(err => {
      this.log(`Failed to construct task for type ${body.type} with params: ${JSON.stringify(body.parameters)} error: ${err}`);
      return undefined;
    });
  }

  private static parseMessageType(message: Message) {
    return message.MessageAttributes && message.MessageAttributes.type.StringValue ? message.MessageAttributes.type.StringValue : 'unknown';
  }

  private static getDuration(start: Date) {
    const duration = new Date().getTime() - start.getTime();
    if (duration < 1000) {
      return `${duration} ms`;
    } else if (duration < 60 * 1000) {
      return `${(duration / 1000).toFixed(2)} sec`;
    } else if (duration < 3600 * 1000) {
      return `${(duration / 1000 / 60).toFixed(2)} min`;
    } else {
      return `${(duration / 1000 / 3600).toFixed(2)} hrs`;
    }
  }

}
