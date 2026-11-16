import * as nj from '../../common/nest.js';
import { AuthGuard } from '@nestjs/passport';

@nj.injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}