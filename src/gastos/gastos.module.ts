import { Module } from '@nestjs/common';
import { GastosService } from './services/gastos.service.js';
import { GastosDeps } from './services/gastos-deps.js';
import { GastosConsultaService } from './services/gastos-consulta.service.js';
import { GastosEscrituraService } from './services/gastos-escritura.service.js';
import { GastosResumenService } from './services/gastos-resumen.service.js';
import { GastosRecurrentesService } from './services/gastos-recurrentes.service.js';
import { UsuariosGastosService } from './services/usuarios-gastos.service.js';
import { GastosAltaController } from './controllers/gastos-alta.controller.js';
import { GastosListadoController } from './controllers/gastos-listado.controller.js';
import { GastosResumenController } from './controllers/gastos-resumen.controller.js';
import { GastosBotController } from './controllers/gastos-bot.controller.js';
import { GastosRecurrentesController } from './controllers/gastos-recurrentes.controller.js';
import { GastosDetalleController } from './controllers/gastos-detalle.controller.js';
import { GastosRecurrentesScheduler } from './scheduler/gastos-recurrentes.scheduler.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  // El orden importa: las rutas literales se registran antes que `:id`.
  controllers: [
    GastosBotController,
    GastosResumenController,
    GastosRecurrentesController,
    GastosAltaController,
    GastosListadoController,
    GastosDetalleController,
  ],
  providers: [
    GastosService,
    GastosDeps,
    GastosConsultaService,
    GastosEscrituraService,
    GastosResumenService,
    GastosRecurrentesService,
    UsuariosGastosService,
    GastosRecurrentesScheduler,
  ],
  exports: [GastosService],
})
export class GastosModule {}
