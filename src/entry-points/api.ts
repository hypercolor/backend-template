import 'reflect-metadata';
import {Server} from '../express-app/server';
import { TaskRegistry } from '../worker/task-registry';
import { SqsWorker } from '../worker/lib/sqs-worker';
import { Config } from '../util/config';


SqsWorker.initSubmitter({
  sqsUrl: Config.SQS_URL_ASYNC_WORKER,
  tasks: TaskRegistry.allTasks()
});

new Server()
  .start()
  .catch(err => {
    console.log('Error starting server: ');
    console.log(err);
    process.exit(1);
  });
