import * as nest from '@nestjs/common';
import { AuthRegistroService } from '../services/auth-registro.service.js';
import { AuthLoginService } from '../services/auth-login.service.js';
import { AuthPerfilService } from '../services/auth-perfil.service.js';
import * as DTO from '../dto/index.js';
import { Autenticado } from '../decorators/autenticado.decorator.js';
import { GetUser } from '../decorators/get-user.decorator.js';

@nest.Controller('auth')
export class AuthController {
  constructor(
    private readonly registro: AuthRegistroService,
    private readonly loginService: AuthLoginService,
    private readonly perfilService: AuthPerfilService,
  ) {}

  @nest.Post('register')
  register(@nest.Body() dto: DTO.RegisterDto) {
    return this.registro.register(dto);
  }

  @nest.Post('login')
  login(@nest.Body() dto: DTO.LoginDto) {
    return this.loginService.login(dto);
  }

  /** Perfil del usuario autenticado: lo usa el front para restaurar la sesión. */
  @nest.Get('me')
  @Autenticado()
  me(@GetUser('id') usuarioId: number) {
    return this.perfilService.perfil(usuarioId);
  }
}
