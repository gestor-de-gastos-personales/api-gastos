import { Module } from '@nestjs/common';
import { GastosService } from './services/gastos.service.js';
import { GastosAltaController } from './controllers/gastos-alta.controller.js';
import { GastosListadoController } from './controllers/gastos-listado.controller.js';
import { GastosResumenController } from './controllers/gastos-resumen.controller.js';
import { GastosBotController } from './controllers/gastos-bot.controller.js';
import { GastosEdicionController } from './controllers/gastos-edicion.controller.js';
import { GastosRecurrentesController } from './controllers/gastos-recurrentes.controller.js';
import { GastosUltimoController } from './controllers/gastos-ultimo.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  // El orden importa: 'resumen' debe registrarse antes que ':id'.
  controllers: [
    GastosBotController,
    GastosResumenController,
    GastosRecurrentesController,
    GastosAltaController,
    GastosListadoController,
    GastosUltimoController,
    GastosEdicionController,
  ],
  providers: [GastosService],
})
export class GastosModule {}
