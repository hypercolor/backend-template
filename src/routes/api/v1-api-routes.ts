import {AuthenticatedRouter} from '../classes/authenticated-router';
import e from 'express';
import {ControllerFactory} from '../classes/controller-factory';
import { GetHelloWorldController } from "./v1/hello/get";
import { ExampleAuthenticator } from '../../auth/example-authenticator';
import { PermissionsMiddleware } from '../../auth/permissions-middleware';
import { PermissionsChecks } from '../../auth/permissions-checks';

export class V1ApiRoutes {
    public static buildAndMountRoutes(expressApp: e.Application, mountPoint: string) {
        const routers = [
            //Unauthenticated routes live here
            AuthenticatedRouter.build({
                controllerBuilder: ControllerFactory.jsonApi
            }, router => {

                router.route('/hello').get(GetHelloWorldController);

            }),

            //authenticated routes live here
            AuthenticatedRouter.build({
                controllerBuilder: ControllerFactory.jsonApi,
                middleware: [
                    new ExampleAuthenticator().handler,
                    PermissionsMiddleware.all([
                        //Call PermissionsChecks method here
                    ])
                ]

            }, router => {

            }),
        ];

        routers.forEach(router => {
            expressApp.use(mountPoint, router.router);
        });
        return routers;
    }
}
