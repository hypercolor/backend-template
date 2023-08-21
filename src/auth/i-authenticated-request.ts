import * as e from 'express';

export interface IAuthenticatedRequest extends e.Request {
    user?: any; //change this key/value pai to whatever domain will be authenticated e.g. profile: Profile | user: User
}
