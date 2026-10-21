import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: any) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: any) {
    return this.authService.login(dto);
  }

  // 👈 Vincular un usuario existente de la Web con su Telegram
  @Post('vincular-telegram')
  vincularTelegram(@Body() dto: { email: string; password: string; telegramId: string }) {
    return this.authService.vincularTelegram(dto);
  }

  // 👈 Registrar un nuevo usuario desde Telegram directamente
  @Post('register-telegram')
  registerTelegram(@Body() dto: { email: string; password: string; nombre?: string; telegramId: string }) {
    return this.authService.registerTelegram(dto);
  }
}