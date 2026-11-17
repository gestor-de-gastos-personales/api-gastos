import * as nj from '../common/nest.js';
import { GruposController } from './grupos.controller.js';
import { GruposService } from './grupos.service.js';

@nj.modulo({
  controllers: [GruposController],
  providers: [GruposService],
})
export class GruposModule {}
