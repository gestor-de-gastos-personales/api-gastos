import { GastosModule } from './gastos/gastos.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PresupuestosModule } from './presupuestos/presupuestos.module.js';
import { ChatModule } from './chat/chat.module.js';

export const FEATURES = {
  GastosModule,
  PrismaModule,
  CategoriasModule,
  AuthModule,
  PresupuestosModule,
  ChatModule,
};
