import { Prisma } from '@prisma/client';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter.js';

describe('PrismaClientExceptionFilter', () => {
  const filtro = new PrismaClientExceptionFilter();

  function hostFalso() {
    const respuesta = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => respuesta,
        getRequest: () => ({ url: '/gastos' }),
      }),
    };
    return { host, respuesta };
  }

  function excepcion(codigo: string, meta?: Record<string, unknown>) {
    return new Prisma.PrismaClientKnownRequestError('fallo', {
      code: codigo,
      clientVersion: '6.0.0',
      meta,
    });
  }

  it('traduce P2002 a 409 con el campo duplicado', () => {
    const { host, respuesta } = hostFalso();

    filtro.catch(excepcion('P2002', { target: ['email'] }), host as never);

    expect(respuesta.status).toHaveBeenCalledWith(409);
    expect(respuesta.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Violación de restricción única en: [email]' }),
    );
  });

  it('traduce P2025 a 404', () => {
    const { host, respuesta } = hostFalso();

    filtro.catch(excepcion('P2025'), host as never);

    expect(respuesta.status).toHaveBeenCalledWith(404);
  });

  it('traduce P2003 a 400', () => {
    const { host, respuesta } = hostFalso();

    filtro.catch(excepcion('P2003'), host as never);

    expect(respuesta.status).toHaveBeenCalledWith(400);
  });

  it('usa un mensaje genérico cuando no hay target', () => {
    const { host, respuesta } = hostFalso();

    filtro.catch(excepcion('P2002'), host as never);

    expect(respuesta.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Violación de restricción única en: [campo duplicado]',
      }),
    );
  });
});
