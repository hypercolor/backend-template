import {Request, Response} from 'express';
import {NotFoundError} from '../../util/errors';
import {Responses} from '../classes/responses';


export class Controller404 {

  public static handler = (req: Request, res: Response) => {
    Responses.sendErrorResponse(req, res, new NotFoundError('Cannot ' + req.method + ' ' + req.originalUrl + '.'));
    // Responses.sendErrorResponse(req,res,'404 Handler')({code: 404, error: 'Cannot ' + req.method + ' ' + req.originalUrl + '.'});
  }

}

