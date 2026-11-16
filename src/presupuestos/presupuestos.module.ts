import * as nj from '../common/nest.js';
import { PresupuestosController } from './presupuestos.controller.js';
import { PresupuestosService } from './presupuestos.service.js';
import { AuthModule } from '../auth/auth.module.js';

@nj.modulo({
  imports: [AuthModule],
  controllers: [PresupuestosController],
  providers: [PresupuestosService],
})
export class PresupuestosModule {}
