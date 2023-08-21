import * as e from 'express';

export class Root {

     public static build(): e.Router {
    const router = e.Router();

    router.route('/')
    .get(function(req: e.Request, res: e.Response){
      res.json({message: 'This is the API, please visit our website.'});
    });

    return router;
  }
}
