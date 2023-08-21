import {Mapper} from '../../models/dto/mappers/mapper';
import {ITaskClass} from './sqs-worker-types';
import { Task } from './task';

export class TaskFactory {
  private static taskTypes: { [key: string]: ITaskClass } = {};

  public static registerTask(taskType: ITaskClass) {
    this.taskTypes[taskType.name] = taskType;
  }

  public static async build(type: string, parameters?: { [key: string]: any }, verbose?: boolean): Promise<Task> {
    type = type.trim();

    // if (verbose) {
    //   Logger.log('TaskFactory: Building task: ' + type);
    // }

    const taskType = this.taskTypes[type];

    if (!taskType) {
      throw new Error('Invalid task type: ' + type);
    }

    // if (verbose) {
    //   Logger.log('ts-sqs-worker.TaskFactory: Got taskType: ', taskType);
    // }

    const task = Mapper.mapInput(parameters || {}, taskType);

    // if (verbose) {
    //   Logger.log('ts-sqs-worker.TaskFactory: Built task: ', task);
    // }
    return task;
  }
}
