import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { VincularTelegramDto } from '../dto/vincular-telegram.dto.js';
import { RegisterTelegramDto } from '../dto/register-telegram.dto.js';
import * as bcrypt from 'bcrypt';

const hashear = (password: string) => bcrypt.hash(password, 10);
const verificar = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

/** Excepciones de dominio reutilizables: evitan repetir la construcción. */
const credencialesInvalidas = () =>
  new UnauthorizedException('Credenciales inválidas');
const conflicto = (mensaje: string) => new ConflictException(mensaje);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  private async asegurarTelegramDisponible(
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

  /** Valida email + contraseña y devuelve el usuario autenticado. */
  private async autenticar(email: string, password: string) {
    const usuario = await this.buscarPorEmail(email);

    if (!usuario || !usuario.password) {
      throw credencialesInvalidas();
    }

    if (!(await verificar(password, usuario.password))) {
      throw credencialesInvalidas();
    }

    return usuario;
  }

  /** Crea el usuario y omite el hash de la contraseña en la respuesta. */
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

  async register(dto: RegisterDto) {
    await this.asegurarEmailDisponible(dto.email);

    return this.crearUsuario({
      email: dto.email,
      password: dto.password,
      nombre: dto.nombre,
    });
  }

  async login(dto: LoginDto) {
    const usuario = await this.autenticar(dto.email, dto.password);

    return {
      access_token: await this.jwtService.signAsync({
        sub: usuario.id,
        email: usuario.email,
      }),
    };
  }

  // Vincular una cuenta Web existente con un telegramId
  async vincularTelegram(dto: VincularTelegramDto) {
    const usuario = await this.autenticar(dto.email, dto.password);

    await this.asegurarTelegramDisponible(dto.telegramId, usuario.id);

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { telegramId: String(dto.telegramId) },
    });

    const { password: _password, ...result } = usuarioActualizado;
    return result;
  }

  // Registrar un nuevo usuario completo (Web + Telegram) desde el Bot
  async registerTelegram(dto: RegisterTelegramDto) {
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
