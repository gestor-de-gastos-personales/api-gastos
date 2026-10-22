import pino from 'pino';
import type { LoggerOptions } from 'pino';
import type { Params } from 'nestjs-pino';

const SERVICIO = 'api-gastos';

/**
 * Opciones base de pino para la aplicación.
 *
 * - Desarrollo: `pino-pretty` con colores y timestamps cortos.
 * - Producción: JSON estructurado listo para agregadores de logs.
 * - Tests: nivel `silent` para no ensuciar la salida de la suite.
 */
export function crearOpcionesPino(): LoggerOptions {
  const entorno = process.env.NODE_ENV ?? 'development';
  const esTest = entorno === 'test';
  const esProduccion = entorno === 'production';

  const opciones: LoggerOptions = {
    level: process.env.LOG_LEVEL || (esTest ? 'silent' : 'info'),
    base: { servicio: SERVICIO },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (etiqueta) => ({ level: etiqueta }),
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
      ],
      censor: '[REDACTADO]',
    },
  };

  if (esProduccion || esTest) {
    return opciones;
  }

  return {
    ...opciones,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: true,
      },
    },
  };
}

/**
 * Configuración que consume `nestjs-pino`: logger HTTP + logger de Nest.
 */
export function crearOpcionesLogger(): Params {
  const esTest = process.env.NODE_ENV === 'test';

  return {
    pinoHttp: {
      ...crearOpcionesPino(),
      autoLogging: !esTest,
      customLogLevel: (_request, response, error) => {
        if (error || response.statusCode >= 500) return 'error';
        if (response.statusCode >= 400) return 'warn';
        return 'info';
      },
    },
  };
}
