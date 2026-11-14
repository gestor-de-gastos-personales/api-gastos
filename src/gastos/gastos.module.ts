import * as nest from '@nestjs/common';
import { GastosService } from './services/gastos.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { GASTOS_CONTROLLERS, GASTOS_PROVIDERS } from './gastos.providers.js';

@nest.Module({
  imports: [PrismaModule, AuthModule],
  controllers: GASTOS_CONTROLLERS,
  providers: GASTOS_PROVIDERS,
  exports: [GastosService],
})
export class GastosModule {}
