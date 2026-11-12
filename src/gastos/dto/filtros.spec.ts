import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterGastosDto } from './filter-gasto.dto.js';
import { FilterUltimosDto } from './filter-ultimos.dto.js';
import { FilterResumenBotDto } from './filter-resumen-bot.dto.js';
import { FilterResumenDto } from './filter-resumen.dto.js';
import { UpdateGastoDto } from './update-gasto.dto.js';

async function erroresDe<T extends object>(clase: new () => T, datos: object) {
  return validate(plainToInstance(clase, datos));
}

describe('FilterGastosDto', () => {
  it('acepta rango de fechas, categoría y montos', async () => {
    const dto = plainToInstance(FilterGastosDto, {
      fechaInicio: '01-11-2026',
      fechaFin: '30-11-2026',
      categoriaId: '2',
      montoMin: '100',
      montoMax: '2500.50',
    });

    expect(dto.categoriaId).toBe(2);
    expect(dto.montoMin).toBe(100);
    expect(dto.montoMax).toBe(2500.5);
    await expect(
      erroresDe(FilterGastosDto, {
        fechaInicio: '01-11-2026',
        fechaFin: '30-11-2026',
        categoriaId: '2',
        montoMin: '100',
        montoMax: '2500.50',
      }),
    ).resolves.toHaveLength(0);
  });

  it('rechaza montos negativos o no numéricos', async () => {
    const negativo = await erroresDe(FilterGastosDto, { montoMin: -1 });
    expect(negativo[0].property).toBe('montoMin');

    const texto = await erroresDe(FilterGastosDto, { montoMax: 'mucho' });
    expect(texto[0].property).toBe('montoMax');
  });
});

describe('FilterUltimosDto', () => {
  it('usa limit 10 y page 1 por defecto', async () => {
    const dto = plainToInstance(FilterUltimosDto, {});

    expect(dto.limit).toBe(10);
    expect(dto.page).toBe(1);
    await expect(erroresDe(FilterUltimosDto, {})).resolves.toHaveLength(0);
  });

  it('rechaza un límite mayor a 50', async () => {
    const errores = await erroresDe(FilterUltimosDto, { limit: 51 });

    expect(errores).toHaveLength(1);
    expect(errores[0].property).toBe('limit');
  });

  it('rechaza una página menor a 1', async () => {
    const errores = await erroresDe(FilterUltimosDto, { page: 0 });

    expect(errores[0].property).toBe('page');
  });

  it('rechaza fechas que no son ISO', async () => {
    const errores = await erroresDe(FilterUltimosDto, { desde: '20-10-2026' });

    expect(errores[0].property).toBe('desde');
  });

  it('acepta el filtro completo', async () => {
    const errores = await erroresDe(FilterUltimosDto, {
      telegramId: '123',
      limit: 5,
      page: 2,
      categoria: 'Comida',
      desde: '2026-10-01',
      hasta: '2026-10-31',
    });

    expect(errores).toHaveLength(0);
  });
});

describe('FilterResumenBotDto', () => {
  it('exige el telegramId', async () => {
    const errores = await erroresDe(FilterResumenBotDto, {});

    expect(errores[0].property).toBe('telegramId');
  });

  it('acepta el rango TODAY', async () => {
    const errores = await erroresDe(FilterResumenBotDto, {
      telegramId: '123',
      rango: 'TODAY',
    });

    expect(errores).toHaveLength(0);
  });

  it('rechaza un rango desconocido', async () => {
    const errores = await erroresDe(FilterResumenBotDto, {
      telegramId: '123',
      rango: 'DECADE',
    });

    expect(errores[0].property).toBe('rango');
  });

  it('acepta el filtro por categoría', async () => {
    const errores = await erroresDe(FilterResumenBotDto, {
      telegramId: '123',
      categoria: 'Comida',
    });

    expect(errores).toHaveLength(0);
  });
});

describe('FilterResumenDto', () => {
  it('acepta rango y fechas explícitas', async () => {
    const errores = await erroresDe(FilterResumenDto, {
      rango: 'MONTH',
      desde: '2026-10-01',
      hasta: '2026-10-31',
    });

    expect(errores).toHaveLength(0);
  });

  it('rechaza un mes fuera de rango', async () => {
    const errores = await erroresDe(FilterResumenDto, { mes: 13 });

    expect(errores[0].property).toBe('mes');
  });
});

describe('UpdateGastoDto', () => {
  it('acepta los alias del bot sin validar tipo', async () => {
    const errores = await erroresDe(UpdateGastoDto, {
      monto: 500,
      comercio: 'Shell',
      categoria: 'Transporte',
    });

    expect(errores).toHaveLength(0);
  });

  it('acepta el contrato web', async () => {
    const errores = await erroresDe(UpdateGastoDto, {
      descripcion: 'Cena',
      valor: 1200,
      fecha: '2026-10-20',
      categoria: 1,
    });

    expect(errores).toHaveLength(0);
  });

  it('rechaza una fecha inválida', async () => {
    const errores = await erroresDe(UpdateGastoDto, { fecha: 'ayer' });

    expect(errores[0].property).toBe('fecha');
  });
});
