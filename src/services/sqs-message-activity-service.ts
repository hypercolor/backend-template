import {SqsMessage} from '../models/domain/mongo/sqs-message';
import {SqsMessageActivity} from '../models/domain/mongo/sqs-message-activity';
import {SqsMessageActivityType} from '../models/enums/sqs-message-activity-type';
import {Config} from '../util/config';
import {Logger} from '../util/logger';

export class SqsMessageActivityService {
  public static async recordMessageReceived(messageBody: any, queueUrl: string) {
    if (!messageBody) {
      Logger.warn('Cannot record message received for message: ', messageBody);
      return;
    }
    if (!messageBody.messageId && messageBody.cron_job) {
      if (Config.WORKER_VERBOSE) {
        Logger.log('Creating sqs_message in mongoDB for cron_job message: ', messageBody);
      }
      const record = await SqsMessage.create({
        queueUrl,
        type: messageBody.type,
        parameters: messageBody.parameters,
        sender: messageBody.cron_job,
      });

      messageBody.messageId = record._id.toString();
    }
    return this.recordMessageActivity(SqsMessageActivityType.Received, messageBody);
  }

  public static async recordMessageProcessed(messageBody: any, durationMs: number) {
    return this.recordMessageActivity(SqsMessageActivityType.Processed, messageBody, durationMs);
  }

  public static async recordMessageError(messageBody: any, durationMs: number, error: any) {
    return this.recordMessageActivity(SqsMessageActivityType.Processed, messageBody, durationMs, error, false);
  }

  public static async recordMessageErrorRetryable(messageBody: any, durationMs: number, error: any) {
    return this.recordMessageActivity(SqsMessageActivityType.Processed, messageBody, durationMs, error, true);
  }

  private static async recordMessageActivity(type: SqsMessageActivityType, messageBody: any, durationMs?: number, error?: any, errorRetryable?: boolean) {
    if (!messageBody || !messageBody.messageId) {
      Logger.warn('Cannot record message activity of ' + type + ' for: ', messageBody);
    }
    let activity;
    try {
      activity = {
        messageId: messageBody.messageId,
        app: Config.APP_NAME,
        type,
        error,
        errorRetryable,
        durationMs,
      };
      await SqsMessageActivity.create(activity);
    } catch (err) {
      Logger.error('Error inserting SqsMessageActivity: ', err);
      Logger.error('Message was: ', JSON.stringify(activity));
    }
  }
}
