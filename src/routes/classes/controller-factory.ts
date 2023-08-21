import * as e from 'express';
import * as util from 'util';
import {Controller} from './controller';
import {Responses} from './responses';


interface IControllerType {
  successCode?: number;
  new(req: e.Request, res: e.Response, next: e.NextFunction): Controller;
}
export class ControllerFactory {

  public static jsonApi(controllerType: IControllerType): e.RequestHandler {
    return (req: e.Request, res: e.Response, next: e.NextFunction) => {
      new controllerType(req, res, next).start()
      .then(result => {
        if (util.types.isPromise(result)) {
          console.log('Warning, handler result is a promise, did you forget to await?');
        }
        if (controllerType.successCode === 204 || result === undefined) {
          return Responses.sendOkResponse(req, res);
        } else {
          return Responses.sendOkResponse(req, res, {
            statusCode: controllerType.successCode || 200,
            data: result
          });
        }
      })
      .catch(handlerError => {
        return Responses.sendErrorResponse(req, res, handlerError);
      });
    };
  }

}
