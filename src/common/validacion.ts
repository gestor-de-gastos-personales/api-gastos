import { esEntero, esNumero, minimo } from './validadores.js';
import { Type } from 'class-transformer';
import { IsBoolean, Max } from 'class-validator';

type DecoradorPropiedad = (target: object, key: string | symbol) => void;

/** Aplica varios decoradores de propiedad sobre el mismo campo. */
function aplicar(...decoradores: DecoradorPropiedad[]): DecoradorPropiedad {
  return (target, key) => {
    for (const decorador of decoradores) {
      decorador(target, key);
    }
  };
}

/** Convierte el valor recibido a número antes de validarlo. */
export function numero(): DecoradorPropiedad {
  return Type(() => Number) as DecoradorPropiedad;
}

/** Convierte a número y valida que sea entero. */
export function entero(): DecoradorPropiedad {
  return aplicar(Type(() => Number) as DecoradorPropiedad, esEntero() as DecoradorPropiedad);
}

/** Convierte a número y valida que sea un número (admite decimales). */
export function decimal(): DecoradorPropiedad {
  return aplicar(
    Type(() => Number) as DecoradorPropiedad,
    esNumero() as DecoradorPropiedad,
  );
}

/** Convierte el valor a booleano antes de validarlo. */
export function booleano(): DecoradorPropiedad {
  return aplicar(
    Type(() => Boolean) as DecoradorPropiedad,
    IsBoolean() as DecoradorPropiedad,
  );
}

/** Valida que un número esté dentro del rango [valorMinimo, valorMaximo]. */
export function rango(valorMinimo: number, valorMaximo: number): DecoradorPropiedad {
  return aplicar(minimo(valorMinimo) as DecoradorPropiedad, Max(valorMaximo) as DecoradorPropiedad);
}
