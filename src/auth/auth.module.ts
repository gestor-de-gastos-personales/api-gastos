import * as nest from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module.js';
import * as jwtConfig from './jwt.config.js';
import { AUTH_CONTROLLERS, AUTH_PROVIDERS } from './auth.providers.js';

@nest.Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: jwtConfig.leerJwtSecret(),
        signOptions: jwtConfig.OPCIONES_JWT,
      }),
    }),
  ],
  controllers: AUTH_CONTROLLERS,
  providers: AUTH_PROVIDERS,
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
