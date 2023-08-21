import {SqsWorkerConsumer} from './sqs-worker-consumer';
import {ISqsSubmitterConfig, ISqsWorkerConfig} from './sqs-worker-types';
import { TaskFactory } from './task-factory';
import {Logger} from "../../util/logger";


export class SqsWorker {

  private consumers: Array<SqsWorkerConsumer> = [];

  public static initSubmitter(config: ISqsSubmitterConfig) {
    config.tasks.forEach(taskType => {
      taskType.workerConfig = config;
    });
  }

  constructor(public config: ISqsWorkerConfig) {

    config.tasks.forEach(taskType => {
      if (this.config.verbose) {
        Logger.log('registering task for consuming: ' + taskType.name);
      }
      taskType.workerConfig = this.config;
      TaskFactory.registerTask(taskType);
    });

    for (var ii=0; ii<config.concurrency; ii+=1) {
      this.consumers.push(new SqsWorkerConsumer({
        ...this.config,
        id: `w${ii}`
      }));
    }

  }

  public async start() {
    await Promise.all(this.consumers.map(consumer => consumer.start()));
    if (this.config.verbose) {
      Logger.log('Worker started with concurrency: ' + this.consumers.length);
    }
  }


}
