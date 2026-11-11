import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import { RegisterDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { Autenticado } from '../decorators/autenticado.decorator.js';
import { GetUser } from '../decorators/get-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Perfil del usuario autenticado: lo usa el front para restaurar la sesión. */
  @Get('me')
  @Autenticado()
  me(@GetUser('id') usuarioId: number) {
    return this.authService.perfil(usuarioId);
  }
}
