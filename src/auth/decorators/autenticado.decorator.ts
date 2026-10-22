import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

/**
 * Marca un controlador o método como protegido por JWT.
 * Encapsula el guard para que los controladores dependan de una
 * única abstracción de autenticación.
 */
export const Autenticado = () => applyDecorators(UseGuards(JwtAuthGuard));
