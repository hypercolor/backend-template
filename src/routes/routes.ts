import express = require('express');

import {Controller404} from './root/404';
import {Root} from './root/root';
import {V1ApiRoutes} from './api/v1-api-routes';

export class Routes {

  public static register(app: express.Application) {

    app.use(Root.build());

    app.use(express.static('public'));

    V1ApiRoutes.buildAndMountRoutes(app, '/api/v1');

    // 404 handler must be the last route in the chain
    app.use(Controller404.handler);

  }


}
