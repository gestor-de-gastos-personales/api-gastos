import { autenticado, getUser } from '../decoradores.js';
import * as nj from '../../common/nest.js';
import { AuthRegistroService } from '../services/auth-registro.service.js';
import { AuthLoginService } from '../services/auth-login.service.js';
import { AuthPerfilService } from '../services/auth-perfil.service.js';
import { LoginDto, RegisterDto } from '../dto/index.js';

@nj.controller('auth')
export class AuthController {
  constructor(
    private readonly registro: AuthRegistroService,
    private readonly loginService: AuthLoginService,
    private readonly perfilService: AuthPerfilService,
  ) {}

  @nj.post('register')
  register(@nj.body() dto: RegisterDto) {
    return this.registro.register(dto);
  }

  @nj.post('login')
  login(@nj.body() dto: LoginDto) {
    return this.loginService.login(dto);
  }

  /** Perfil del usuario autenticado: lo usa el front para restaurar la sesión. */
  @nj.get('me')
  @autenticado()
  me(@getUser('id') usuarioId: number) {
    return this.perfilService.perfil(usuarioId);
  }
}
