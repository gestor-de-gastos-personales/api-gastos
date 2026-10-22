import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VincularTelegramDto } from './dto/vincular-telegram.dto.js';
import { RegisterTelegramDto } from './dto/register-telegram.dto.js';

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

  // 👈 Vincular un usuario existente de la Web con su Telegram
  @Post('vincular-telegram')
  vincularTelegram(@Body() dto: VincularTelegramDto) {
    return this.authService.vincularTelegram(dto);
  }

  // 👈 Registrar un nuevo usuario desde Telegram directamente
  @Post('register-telegram')
  registerTelegram(@Body() dto: RegisterTelegramDto) {
    return this.authService.registerTelegram(dto);
  }
}
