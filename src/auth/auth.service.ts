import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya se encuentra registrado');
    }

    // 1. Hashear contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 2. Crear usuario en DB
    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nombre: dto.nombre,
      },
    });

    // 3. Omitir el hash del password en la respuesta
    const { password, ...result } = usuario;
    return result;
  }

  async login(dto: LoginDto) {
    // 1. Buscar usuario por email
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    // Validar existencia del usuario y que posea contraseña configurada
    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Validar contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar Payload y Token JWT
    const payload = { sub: usuario.id, email: usuario.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // Vincular una cuenta Web existente con un telegramId
  async vincularTelegram(dto: {
    email: string;
    password: string;
    telegramId: string;
  }) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      usuario.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar si el telegramId ya está asociado a otra cuenta
    const existingTgUser = await this.prisma.usuario.findFirst({
      where: { telegramId: String(dto.telegramId) },
    });

    if (existingTgUser && existingTgUser.id !== usuario.id) {
      throw new ConflictException(
        'Este ID de Telegram ya se encuentra vinculado a otra cuenta.',
      );
    }

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { telegramId: String(dto.telegramId) },
    });

    const { password, ...result } = usuarioActualizado;
    return result;
  }

  // Registrar un nuevo usuario completo (Web + Telegram) desde el Bot
  async registerTelegram(dto: {
    email: string;
    password: string;
    nombre?: string;
    telegramId: string;
  }) {
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya se encuentra registrado');
    }

    const existingTgUser = await this.prisma.usuario.findFirst({
      where: { telegramId: String(dto.telegramId) },
    });

    if (existingTgUser) {
      throw new ConflictException(
        'Tu usuario de Telegram ya está vinculado a una cuenta existente',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nombre: dto.nombre || 'Usuario Telegram',
        telegramId: String(dto.telegramId),
      },
    });

    const { password, ...result } = usuario;
    return result;
  }
}