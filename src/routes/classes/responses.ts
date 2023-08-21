import * as e from 'express';
import * as PJSON from 'pjson';
import {IMeta} from '../../models/internal/i-meta';
import {Config} from '../../util/config';
import {DomainError, InternalServerError} from '../../util/errors';
import {Keygen} from '../../util/keygen';
import {PasswordUtil} from '../../util/password-util';

const isCircular = require('is-circular');

const isNumeric = (n: any) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const isValidHttpStatus = (code: number) => {
  return code >= 100 && code < 600;
};


export interface IOkParams {
  meta?: IMeta
  statusCode?: number
  data?: any
  message?: string
}

// export interface IErrorParams {
//   error?: string | object | Error
//   stack?: string
//   message?: string
//   meta?: any
// }

// export interface IResponseParams {
//   code?: number
//   error?: IErrorParams | string
//   ok?: IOkParams
// }


export class Responses {

  public static responseConfig = {
    instrumentAllRequests: Config.INSTRUMENT_EACH_REQUEST,
    instrumentAllErrors: Config.INSTRUMENT_ERRORS_ALL,
    instrument500Errors: Config.INSTRUMENT_ERRORS_500,
    instrumentErrorRequestBodies: Config.INSTRUMENT_ERROR_REQUEST_BODIES,
    instrumentErrorRequestBodiesRouteBlacklist: [],
    environmentDescriptor: Config.ENVIRONMENT_NAME,
    packageConfig: {
      packageName: PJSON.name,
      packageDescription: PJSON.description,
      packageVersion: PJSON.version,
    },
  };

  public static async sendOkResponse(req: e.Request, res: e.Response, params?: IOkParams) {
    if (!params) {

      res.status(204).send();

    } else {

      const statusCode = params.statusCode || 200;

      const responseBody = {
        server: this.buildServerMetadata(),
        request: this.buildRequestMetadata(req),
        data: params.data,
        message: params.message,
        meta: params.meta
      };

      res.status(statusCode)
      .json(responseBody);

    }
  }

  public static async sendErrorResponse(req: e.Request, res: e.Response, error?: DomainError | Error) {

    if (!error) {
      error = new InternalServerError('No error provided');
    } else if (error.constructor !== Error && error.constructor !== TypeError && !(error as DomainError).isDomainError) {
      let errorIsCircular = false;
      try {
        errorIsCircular = isCircular(error);
      } catch(err) {

      }
      if (!errorIsCircular) {
        error = new InternalServerError('Invalid error: ' + JSON.stringify(error) + ' ' + error + ' ' + error.constructor);
      } else {
        let message = 'circular';
        if ((error as any).statusText) {
          message = (error as any).statusText;
        } else if ((error as any).status) {
          message = (error as any).status;
        }
        error = new InternalServerError('Circular error: ' + message);
      }
    }

    const domainError = (error as DomainError).isDomainError ? (error as DomainError) : InternalServerError.wrap(error);

    const code = domainError.statusCode && isNumeric(domainError.statusCode) && isValidHttpStatus(domainError.statusCode) ? domainError.statusCode : 500;

    // const errorParams: IErrorParams = params.error.constructor === String ? { error: params.error } : params.error as IErrorParams;

    // console.log('errorParams: ', errorParams);

    // let error: any = errorParams.error && errorParams.error.constructor === Error ? (errorParams.error as Error).message : errorParams.error;
    // const stack = errorParams.error && errorParams.error.constructor === Error ? (errorParams.error as Error).stack : errorParams.stack;


    const responseBody = {
      server: this.buildServerMetadata(),
      request: this.buildRequestMetadata(req),
      error: domainError.message,
      stack: domainError.stack,
      meta: domainError.meta,
      breadcrumb: Keygen.uid(6).toUpperCase()
    };


    this.instrumentError(code, responseBody, req, domainError);

    res.status(code)
    .json(responseBody);

  }


  private static instrumentError(code: number, responseBody: any, req: e.Request, error: DomainError) {
    if ((code === 500 && this.responseConfig.instrument500Errors) || this.responseConfig.instrumentAllErrors) {
      console.log(code + ' error: ' + JSON.stringify(responseBody, null, 2));

      if (responseBody.stack) {
        console.log('Custom Stack: ' + responseBody.stack.replace(/\\n/g, '\n'));
      }

      if (error.stack !== undefined) {
        console.log('Error Stack: ' + error.stack.replace(/\\n/g, '\n'));
      }
    }

    if (req.body &&
      this.responseConfig.instrumentErrorRequestBodies &&
      (this.responseConfig.instrumentErrorRequestBodiesRouteBlacklist as Array<string>).indexOf(req.url) === -1) {
      const body = PasswordUtil.stripPasswordsFromObject(req.body);
      console.log('Request body for error was: ' + JSON.stringify(body, null, 2));
    }
  }

  private static buildServerMetadata() {
    return {
      name: this.responseConfig.packageConfig.packageName,
      env: this.responseConfig.environmentDescriptor,
      version: this.responseConfig.packageConfig.packageVersion,
    };
  }

  private static buildRequestMetadata(req: e.Request) {
    return {
      url: req.originalUrl,
      method: req.method,
      time: new Date().toISOString()
    };
  }

}
