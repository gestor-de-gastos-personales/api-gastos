import { Module } from '@nestjs/common';
import { PresupuestosController } from './presupuestos.controller.js';
import { PresupuestosService } from './presupuestos.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PresupuestosController],
  providers: [PresupuestosService],
})
export class PresupuestosModule {}
