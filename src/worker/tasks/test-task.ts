import {jsonMember, jsonObject} from 'typedjson';
import {Task} from '../lib/task';

@jsonObject
export class TestTask extends Task {

  @jsonMember public delayMs?: number;
  @jsonMember public throwError?: boolean;

  public async run() {

    if (this.delayMs) {
      await this.delay(this.delayMs);
    }

    if (this.throwError) {
      throw new Error('Test error');
    }

  }

  private async delay(delayMs: number) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }
}
