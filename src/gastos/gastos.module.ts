import { Module } from '@nestjs/common';
import { GastosService } from './gastos.service.js';
import { GastosController } from './gastos.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GastosController],
  providers: [GastosService],
})
export class GastosModule {}