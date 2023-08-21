
import {UnauthorizedError} from '../util/errors';
import {Authenticator} from './authenticator';

export class XAuthTokenAuthenticator extends Authenticator {
    protected async authenticate() {
        const authHeader = this.req.header('X-Auth-Token');
        if (!authHeader) {
            throw new UnauthorizedError('Auth header not present.');
        }
        const session: any = {}; //replace this with a call with the real session service

        if (!session) {
            throw new UnauthorizedError('Auth session not found.');
        }
        // const user = await UserRepository.findOne(session.userId); //replace this with a call with the real user/profile service
        if (!session.user) {
            throw new UnauthorizedError('Auth session user not found');
        }
        // make call to extend expiration if applicable
        return session.user;
    }
}
