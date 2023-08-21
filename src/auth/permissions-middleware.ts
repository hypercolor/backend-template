import * as e from 'express';
import {PromiseQueue} from '@hypercolor/promise-queue';
import {Responses} from '../routes/classes/responses';
import {ForbiddenError} from '../util/errors';
import {PermissionsCheck} from './permissions-checks';
import { Logger } from '../util/logger';


export class PermissionsMiddleware {


  public static atLeastOne(checks: Array<PermissionsCheck>) {
    return this.middleware(async req => {
      const results = await new PromiseQueue(1).runAll(checks.map(check => () => check(req)));
      const allowed = results.some(result => result);
      if (!allowed) {
        throw new ForbiddenError('Forbidden');
      }
    });
  }

  public static all(checks: Array<PermissionsCheck>) {
    return this.middleware(async req => {
      const results = await new PromiseQueue(1).runAll(checks.map(check => () => check(req)));
      const allowed = results.every(result => result);
      if (!allowed) {
        throw new ForbiddenError('Forbidden');
      }
    });
  }

  private static middleware(handler: (req: e.Request) => Promise<any>) {
    return (req: e.Request, res: e.Response, next: e.NextFunction) => {
      handler(req)
      .then(next)
      .catch(() => {
        return Responses.sendErrorResponse(req, res, new ForbiddenError('Forbidden'));
      });
    };
  }
}
