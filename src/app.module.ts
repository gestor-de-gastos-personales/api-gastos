import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GastosModule } from './gastos/gastos.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [GastosModule, PrismaModule, CategoriasModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
