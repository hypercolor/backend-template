
import 'reflect-metadata'; // needed for typeorm, must be first import in the entire chain

import {DatabaseManager} from '../managers/database-manager';
import {Config} from '../util/config';
import {SqsWorker} from '../worker/lib/sqs-worker';
import {TaskRegistry} from '../worker/task-registry';
import {Logger} from '../util/logger';

class Worker {

  public async start() {
    await DatabaseManager.connect();
    Logger.log('Worker listening for tasks at URL: ' + Config.SQS_URL_ASYNC_WORKER);
    const sqsWorker = new SqsWorker({
      sqsUrl: Config.SQS_URL_ASYNC_WORKER,
      verbose: Config.WORKER_VERBOSE,
      concurrency: Config.WORKER_CONCURRENCY,
      tasks: TaskRegistry.allTasks()
    });
    await sqsWorker.start();
  }

}

new Worker().start()
.catch(err => {
  Logger.log('Error starting worker: ');
  Logger.log(err);
  process.exit(1);
});

