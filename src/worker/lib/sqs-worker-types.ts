import {Task} from "./task";


export interface ISqsSubmitterConfig extends ISqsCommon {
  tasks: Array<ITaskClass>;
}

export interface ISqsWorkerConfig extends ISqsWorkerCommon {
  concurrency: number;
  tasks: Array<ITaskClass>;
}

export interface ISqsConsumerConfig extends ISqsWorkerCommon {
  id: string;
}

interface ISqsWorkerCommon extends ISqsCommon {
  verbose?: boolean;
  successCallback?: SqsWorkerSuccessfulTaskCallback;
  failCallback?: SqsWorkerFailedTaskCallback;
}

interface ISqsCommon {
  sqsUrl: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;

}

export interface ISqsWorkerTaskResult {
  durationMs: number;
  taskResult: any;
}

export interface ITaskClass {
  name: string;
  workerConfig: ISqsSubmitterConfig;
  new (): Task;
}

export interface ITaskResult {
  info?: string;
  error?: any;
}


export type SqsWorkerFailedTaskCallback = (taskName: string, error: any) => void;

export type SqsWorkerSuccessfulTaskCallback = (task: Task, result: ISqsWorkerTaskResult) => void;
