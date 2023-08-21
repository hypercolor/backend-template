import { IRoute, NextFunction, Request, RequestHandler, Response, Router } from 'express';
import {Controller} from './controller';

export type IControllerType = new (req: Request, res: Response, next: NextFunction) => Controller;

export interface IAuthenticatedRouterOptions {
  middleware?: Array<RequestHandler>
  controllerBuilder?(controller: IControllerType): RequestHandler
}

export interface IMountedRoute {
  path: string,
  verb: string,
  controller: IControllerType | undefined
}

export class AuthenticatedRoute {
  private route: IRoute;
  private myMiddleware: Array<RequestHandler> = [];

  public verb = 'unknown';
  public controller?: IControllerType;

  constructor(public routePrefix: string, router: Router, private opts: IAuthenticatedRouterOptions) {
    this.route = router.route(routePrefix);
  }

  public use(middleware: RequestHandler) {
    this.myMiddleware.push(middleware);
    return this;
  }

  public get(controller: IControllerType | RequestHandler) {
    return this.handleMethod('get', controller);
  }

  public post(controller: IControllerType | RequestHandler) {
    return this.handleMethod('post', controller);
  }

  public put(controller: IControllerType | RequestHandler) {
    return this.handleMethod('put', controller);
  }

  public patch(controller: IControllerType | RequestHandler) {
    return this.handleMethod('patch', controller);
  }

  public delete(controller: IControllerType | RequestHandler) {
    return this.handleMethod('delete', controller);
  }

  public all(controller: IControllerType | RequestHandler) {
    return this.handleMethod('all', controller);
  }

  public options(controller: IControllerType | RequestHandler) {
    return this.handleMethod('options', controller);
  }

  public head(controller: IControllerType | RequestHandler) {
    return this.handleMethod('head', controller);
  }

  private handleMethod(name: string, handler: IControllerType | RequestHandler) {

    this.controller = handler as IControllerType;

    this.verb = name;

    if (this.opts.controllerBuilder) {
      // handler MUST be a Controller type
      handler = this.opts.controllerBuilder(handler as IControllerType);
    }
    // handler = this.opts.controllerGenerator ? this.opts.controllerGenerator(handler) : handler
    (this.route as any)[name](...this.buildMiddlewareArray(), handler);

    return this;
  }

  private buildMiddlewareArray() {
    let handlers: Array<any> = [];
    if (this.opts.middleware) {
      handlers = handlers.concat(this.opts.middleware);
    }
    return handlers.concat(this.myMiddleware);
  }
}

export class AuthenticatedRouter {
  public router: Router = Router();

  public get routes(): Array<IMountedRoute> {
    return this.authenticatedRoutes.map(authenticatedRoute => {
      // console.log('controller ', authenticatedRoute.controller);
      return {
        path: authenticatedRoute.routePrefix,
        verb: authenticatedRoute.verb,
        controller: authenticatedRoute.controller
      };
    });
  }

  private authenticatedRoutes: Array<AuthenticatedRoute> = [];

  constructor(private readonly options?: IAuthenticatedRouterOptions) {
    this.options = options || {};
  }

  public static build(options: IAuthenticatedRouterOptions, builder: (router: AuthenticatedRouter) => void) {
    const router = new AuthenticatedRouter(options);
    builder(router);
    return router;
  }

  public route(route: string) {
    const authenticatedRoute = new AuthenticatedRoute(route, this.router, this.options!);
    this.authenticatedRoutes.push(authenticatedRoute);
    return authenticatedRoute;
  }
}
