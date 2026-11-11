const ORIGENES_POR_DEFECTO = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/**
 * Orígenes permitidos por CORS.
 *
 * Se configuran con `CORS_ORIGINS` (lista separada por comas). Sin la variable
 * se habilitan los orígenes típicos de Vite en desarrollo.
 */
export function origenesCors(valor = process.env.CORS_ORIGINS): string[] {
  if (!valor?.trim()) return [...ORIGENES_POR_DEFECTO];

  return valor
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
}
