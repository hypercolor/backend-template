import { Controller } from "../../../classes/controller";

export class GetHelloWorldController extends Controller {
    public async handleRequest() {
      return {
        message: 'Hello World!'
      }
    }
}
