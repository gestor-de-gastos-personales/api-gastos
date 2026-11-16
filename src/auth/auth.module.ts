import * as nj from '../common/nest.js';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module.js';
import * as jwtConfig from './jwt.config.js';
import { AUTH_CONTROLLERS, AUTH_PROVIDERS } from './auth.providers.js';

@nj.modulo({
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
