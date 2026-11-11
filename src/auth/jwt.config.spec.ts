import { leerJwtSecret } from './jwt.config.js';

describe('leerJwtSecret', () => {
  const original = process.env.JWT_SECRET;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = original;
    }
  });

  it('devuelve el secreto configurado en el entorno', () => {
    process.env.JWT_SECRET = 'secreto-de-prueba';

    expect(leerJwtSecret()).toBe('secreto-de-prueba');
  });

  it('falla si la variable no está definida', () => {
    delete process.env.JWT_SECRET;

    expect(() => leerJwtSecret()).toThrow(/JWT_SECRET/);
  });

  it('falla si la variable está vacía', () => {
    process.env.JWT_SECRET = '   ';

    expect(() => leerJwtSecret()).toThrow(/JWT_SECRET/);
  });
});
