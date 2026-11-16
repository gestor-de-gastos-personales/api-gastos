import * as nj from '../../common/nest.js';

const DIA_MS = 24 * 60 * 60 * 1000;

/** Cálculo de la próxima fecha de ejecución de una regla recurrente. */
@nj.injectable()
export class RecurrenciaCalendarioService {
  calcularProximaEjecucion(
    frecuencia: string,
    diaMes?: number,
    diaSemana?: number,
  ): Date {
    const ahora = new Date();

    if (frecuencia === 'DIARIA') {
      return new Date(ahora.getTime() + DIA_MS);
    }

    if (frecuencia === 'SEMANAL') {
      const dias =
        ((diaSemana ?? ahora.getDay()) - ahora.getDay() + 7) % 7 || 7;
      return new Date(ahora.getTime() + dias * DIA_MS);
    }

    if (frecuencia === 'MENSUAL') {
      const dia = diaMes ?? ahora.getDate();
      return new Date(
        Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() + 1, dia),
      );
    }

    return new Date(
      Date.UTC(
        ahora.getUTCFullYear() + 1,
        ahora.getUTCMonth(),
        ahora.getUTCDate(),
      ),
    );
  }
}
