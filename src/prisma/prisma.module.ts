import * as nj from '../common/nest.js';
import { PrismaService } from './prisma.service.js';

@nj.global()
@nj.modulo({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}