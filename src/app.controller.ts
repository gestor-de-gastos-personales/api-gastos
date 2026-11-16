import * as nj from './common/nest.js';
import { AppService } from './app.service.js';

@nj.controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @nj.get()
  getHello(): string {
    return this.appService.getHello();
  }
}
