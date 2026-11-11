import { Module } from '@nestjs/common';
import { PresupuestosController } from './presupuestos.controller.js';
import { PresupuestosService } from './presupuestos.service.js';

@Module({
  controllers: [PresupuestosController],
  providers: [PresupuestosService],
})
export class PresupuestosModule {}
