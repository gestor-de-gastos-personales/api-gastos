import { afterEach, describe, expect, it, vi } from 'vitest';
import { crearOpcionesLogger, crearOpcionesPino } from './opciones-logger.js';

describe('opciones de logger', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('en desarrollo usa pino-pretty con colores', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOG_LEVEL', 'debug');

    const opciones = crearOpcionesPino();

    expect(opciones.level).toBe('debug');
    expect(opciones.transport).toMatchObject({
      target: 'pino-pretty',
      options: { colorize: true },
    });
    expect(opciones.base).toEqual({ servicio: 'api-gastos' });
  });

  it('en producción emite JSON estructurado sin transporte', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const opciones = crearOpcionesPino();

    expect(opciones.transport).toBeUndefined();
    expect(opciones.level).toBe('info');
  });

  it('en tests silencia los logs y desactiva el log automático de requests', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('LOG_LEVEL', '');

    const opciones = crearOpcionesPino();
    const modulo = crearOpcionesLogger();

    expect(opciones.level).toBe('silent');
    expect(opciones.transport).toBeUndefined();
    expect(modulo.pinoHttp).toMatchObject({ autoLogging: false });
  });

  it('redacta credenciales y cookies de las trazas HTTP', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(crearOpcionesPino().redact).toMatchObject({
      censor: '[REDACTADO]',
      paths: expect.arrayContaining([
        'req.headers.authorization',
        'req.headers.cookie',
      ]),
    });
  });
});
