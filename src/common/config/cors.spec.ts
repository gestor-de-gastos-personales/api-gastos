import { describe, expect, it } from 'vitest';
import { origenesCors } from './cors.js';

describe('origenesCors', () => {
  it('usa los orígenes de Vite por defecto', () => {
    expect(origenesCors(undefined)).toEqual([
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ]);
  });

  it('parte CORS_ORIGINS por comas y limpia espacios', () => {
    expect(origenesCors(' https://a.com , https://b.com ,')).toEqual([
      'https://a.com',
      'https://b.com',
    ]);
  });

  it('ignora un valor vacío', () => {
    expect(origenesCors('   ')).toEqual([
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ]);
  });
});
