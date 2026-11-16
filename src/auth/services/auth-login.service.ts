import * as nj from '../../common/nest.js';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import type * as DTO from '../dto/index.js';
import * as bcrypt from 'bcrypt';

const verificar = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

const credencialesInvalidas = () =>
  new nj.noAutorizado('Credenciales inválidas');

/** Validación de credenciales y emisión del JWT web. */
@nj.injectable()
export class AuthLoginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  /** Valida email + contraseña y devuelve el usuario autenticado. */
  async autenticar(email: string, password: string) {
    const usuario = await this.buscarPorEmail(email);

    if (!usuario || !usuario.password) {
      throw credencialesInvalidas();
    }

    if (!(await verificar(password, usuario.password))) {
      throw credencialesInvalidas();
    }

    return usuario;
  }

  async login(dto: DTO.LoginDto) {
    const usuario = await this.autenticar(dto.email, dto.password);

    return {
      access_token: await this.jwtService.signAsync({
        sub: usuario.id,
        email: usuario.email,
      }),
    };
  }
}
