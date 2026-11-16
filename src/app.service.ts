import * as nj from './common/nest.js';

@nj.injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
