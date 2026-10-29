/**
 * Configuración del secreto JWT.
 *
 * El secreto se lee siempre de `process.env.JWT_SECRET`. No existe un valor
 * por defecto: un fallback hardcodeado equivale a una credencial publicada en
 * el repositorio y permite firmar tokens válidos en cualquier entorno.
 */
export function leerJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim() === '') {
    throw new Error(
      'Falta la variable de entorno JWT_SECRET. Configurala en el archivo .env (ver .env.example).',
    );
  }

  return secret;
}

/** Opciones compartidas por `JwtModule` y `JwtStrategy`. */
export const OPCIONES_JWT = {
  expiresIn: '1d',
} as const;
