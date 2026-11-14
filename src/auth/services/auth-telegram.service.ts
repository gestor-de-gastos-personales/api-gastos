import * as nest from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthLoginService } from './auth-login.service.js';
import { AuthRegistroService } from './auth-registro.service.js';
import type * as DTO from '../dto/index.js';

/** Flujos de autenticación que consume el bot de Telegram. */
@nest.Injectable()
export class AuthTelegramService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly login: AuthLoginService,
    private readonly registro: AuthRegistroService,
  ) {}

  // Vincular una cuenta Web existente con un telegramId
  async vincularTelegram(dto: DTO.VincularTelegramDto) {
    const usuario = await this.login.autenticar(dto.email, dto.password);

    await this.registro.asegurarTelegramDisponible(dto.telegramId, usuario.id);

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { telegramId: String(dto.telegramId) },
    });

    const { password: _password, ...result } = usuarioActualizado;
    return result;
  }

  // Registrar un nuevo usuario completo (Web + Telegram) desde el Bot
  registerTelegram(dto: DTO.RegisterTelegramDto) {
    return this.registro.registerTelegram(dto);
  }
}
