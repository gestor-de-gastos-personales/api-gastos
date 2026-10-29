import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { TelegramAuthController } from './controllers/telegram-auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { OPCIONES_JWT, leerJwtSecret } from './jwt.config.js';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // `registerAsync` difiere la lectura del secreto al arranque del módulo,
    // así los tests unitarios no dependen de tener JWT_SECRET definido.
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: leerJwtSecret(),
        signOptions: OPCIONES_JWT,
      }),
    }),
  ],
  controllers: [AuthController, TelegramAuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
