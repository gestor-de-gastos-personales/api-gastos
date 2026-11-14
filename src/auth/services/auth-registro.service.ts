import * as nest from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type * as DTO from '../dto/index.js';
import * as bcrypt from 'bcrypt';

const hashear = (password: string) => bcrypt.hash(password, 10);
const conflicto = (mensaje: string) => new nest.ConflictException(mensaje);

/** Alta de usuarios web y de Telegram. */
@nest.Injectable()
export class AuthRegistroService {
  constructor(private readonly prisma: PrismaService) {}

  private async buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  private async buscarPorTelegram(telegramId: string) {
    return this.prisma.usuario.findFirst({
      where: { telegramId: String(telegramId) },
    });
  }

  private async asegurarEmailDisponible(email: string) {
    if (await this.buscarPorEmail(email)) {
      throw conflicto('El email ya se encuentra registrado');
    }
  }

  async asegurarTelegramDisponible(
    telegramId: string,
    exceptoUsuarioId?: number,
  ) {
    const existente = await this.buscarPorTelegram(telegramId);

    if (existente && existente.id !== exceptoUsuarioId) {
      throw conflicto(
        'Este ID de Telegram ya se encuentra vinculado a otra cuenta.',
      );
    }
  }

  private async crearUsuario(data: {
    email: string;
    password: string;
    nombre: string;
    telegramId?: string;
  }) {
    const usuario = await this.prisma.usuario.create({
      data: { ...data, password: await hashear(data.password) },
    });

    const { password: _password, ...result } = usuario;
    return result;
  }

  async register(dto: DTO.RegisterDto) {
    await this.asegurarEmailDisponible(dto.email);

    return this.crearUsuario({
      email: dto.email,
      password: dto.password,
      nombre: dto.nombre,
    });
  }

  async registerTelegram(dto: DTO.RegisterTelegramDto) {
    await this.asegurarEmailDisponible(dto.email);
    await this.asegurarTelegramDisponible(dto.telegramId);

    return this.crearUsuario({
      email: dto.email,
      password: dto.password,
      nombre: dto.nombre || 'Usuario Telegram',
      telegramId: String(dto.telegramId),
    });
  }
}
