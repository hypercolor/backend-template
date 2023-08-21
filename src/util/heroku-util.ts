import * as e from 'express';

export class HerokuUtil {
  public static getIpAddress(request: e.Request) {
    let ipAddr = request.headers['x-forwarded-for'];
    let ipAddress = request.socket.remoteAddress;
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
