import { Injectable, UnauthorizedException } from '@nestjs/common';
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

    if (!usuario) {
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
}