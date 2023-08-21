import {NextFunction, Response} from 'express';

import {Responses} from '../routes/classes/responses';
import {IAuthenticatedRequest} from './i-authenticated-request';
import { UnauthorizedError } from '../util/errors';

export abstract class Authenticator {
    protected req: any;
    protected res: any;

    public get handler() {
        return (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
            this.req = req;
            this.res = res;
            this.authenticate()
                .then(user => {
                    req.user = user;
                    next();
                })
                .catch(err => {
                    const code = err.code || 401;
                    Responses.sendErrorResponse(this.req, this.res, new UnauthorizedError('Unauthorized.'));
                });
        };
    }

    protected abstract authenticate(): Promise<any>; //change this return type to whatever domain will be authenticated eg Profile | User | etc
}
