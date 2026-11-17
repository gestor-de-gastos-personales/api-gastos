import * as nj from '../common/nest.js';
import { GastosService } from './services/gastos.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { GASTOS_CONTROLLERS, GASTOS_PROVIDERS } from './gastos.providers.js';

@nj.modulo({
  imports: [PrismaModule, AuthModule],
  controllers: GASTOS_CONTROLLERS,
  providers: GASTOS_PROVIDERS,
  exports: [GastosService],
})
export class GastosModule {}
