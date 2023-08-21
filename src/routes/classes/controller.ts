import {Request, Response} from 'express';

import {UnprocessableEntityError} from '../../util/errors';
import {ObjectId} from 'mongodb';

export abstract class Controller {

  constructor(protected request: Request, protected response: Response) {
  }

  public async start() {
    return this.handleRequest();
  }

  public abstract handleRequest(): Promise<any>;

  protected parseObjectIdRouteParameter(parameterName: string) {
    const value = this.request.params[parameterName];
    if (value === null || value === undefined || value.length !== 24) {
      throw new UnprocessableEntityError('Invalid ' + parameterName + ': ' + value);
    }
    return new ObjectId(value);
  }

  protected parseIntRouteParameter(parameterName: string) {
    const value = this.request.params[parameterName];
    if (value === null || value === undefined || isNaN(parseInt(value))) {
      throw new UnprocessableEntityError('Invalid ' + parameterName + ': ' + value);
    }
    return parseInt(value);
  }

  protected parseOptionalIntQueryParam(param: string) {
    if (!param || !this.request.query[param]) {
      return undefined;
    }
    const parsed = parseInt(this.request.query[param] as string);
    if (isNaN(parsed)) {
      throw {code: 400, error: 'Invalid integer: ' + this.request.query[param]};
    }
    return parsed;
  }
}
