import * as e from 'express';

import {PasswordUtil} from '../util/password-util';
import {Logger} from '../util/logger';
import { Profiler } from 'inspector';
import { ApiRequest } from '../models/domain/mongo/api-request';

export class ApiLoggingService {
  public static async logApiRequest(req: e.Request, status: number, response?: any, meta?: any, error?: Error, stack?: any) {

    // const profile: Profile | undefined = (req as any).profile;
    // const profileId = profile?.profileId;
    //
    // const user: User | undefined = (req as any).user;
    // const userId = user?.userId;

    const ipAddress = this.getIpAddress(req);

    let raw: any;

    const body = req.body?.constructor === Object ? PasswordUtil.stripPasswordsFromObject(req.body): undefined;

    try {
      const contentLength = req.header('content-length');
      const requestBytes = contentLength ? parseInt(contentLength) : 0;

      await ApiRequest.create({
        method: req.method,
        responseStatus: status,
        path: req.url,
        // profileId,
        // userId,
        error,
        stack,
        meta,
        isError: !!error,
        requestBytes,
        body,
        response,
        app: 'admin-api',
        ipAddress,
        createdAt: new Date()
        // requestBytes: req.body ? req.body.length : 0,
        // responseBytes:
      });

    } catch (err) {
      Logger.log('Error saving api_request: ', err);
      Logger.log('Tried to save: ' + JSON.stringify(raw, null, 2));
    }
  }

  public static getIpAddress(request: e.Request) {
    let ipAddr = request.headers['x-forwarded-for'];
    let ipAddress = request.connection.remoteAddress;
    if (ipAddr) {
      if (ipAddr.constructor === Array) {
        ipAddress = ipAddr[ipAddr.length - 1];
      } else {
        var list = (ipAddr as string).split(',');
        ipAddress = list[list.length - 1];
      }
    }
    return ipAddress as string;
  }
}

