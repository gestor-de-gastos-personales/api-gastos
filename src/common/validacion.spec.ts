import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { PaginacionDto } from './dto/paginacion.dto.js';
import { FilterGastosDto } from '../gastos/dto/filter-gasto.dto.js';
import { FilterUltimosDto } from '../gastos/dto/filter-ultimos.dto.js';
import { CreateGastoRecurrenteDto } from '../gastos/dto/create-gasto-recurrente.dto.js';
import { UpdateGastoRecurrenteDto } from '../gastos/dto/update-gasto-recurrente.dto.js';
import { CreatePresupuestoDto } from '../presupuestos/dto/create-presupuesto.dto.js';

async function validar<T extends object>(clase: new () => T, datos: object) {
  const instancia = plainToInstance(clase, datos);
  return validate(instancia, {
    whitelist: false,
    forbidUnknownValues: false,
  });
}

describe('PaginacionDto', () => {
  it('aplica los valores por defecto', async () => {
    const dto = plainToInstance(PaginacionDto, {});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    await expect(validar(PaginacionDto, {})).resolves.toHaveLength(0);
  });

  it('convierte y valida la página', async () => {
    const errores = await validar(PaginacionDto, { page: '3', limit: '0' });
    expect(errores.some((e) => e.property === 'limit')).toBe(true);
  });
});

describe('FilterUltimosDto', () => {
  it('acepta un filtro válido', async () => {
    const errores = await validar(FilterUltimosDto, {
      telegramId: '123',
      limit: '5',
      page: '2',
      desde: '2026-11-01',
    });
    expect(errores).toHaveLength(0);
  });

  it('rechaza una fecha inválida y un límite fuera de rango', async () => {
    const errores = await validar(FilterUltimosDto, {
      limit: '80',
      desde: 'ayer',
    });
    const props = errores.map((e) => e.property);
    expect(props).toContain('limit');
    expect(props).toContain('desde');
  });
});

describe('FilterGastosDto', () => {
  it('acepta fechas dd-mm-yyyy', async () => {
    const errores = await validar(FilterGastosDto, {
      fechaInicio: '01-10-2026',
      fechaFin: '31-10-2026',
      categoriaId: '3',
    });
    expect(errores).toHaveLength(0);
  });

  it('rechaza un formato de fecha incorrecto', async () => {
    const errores = await validar(FilterGastosDto, {
      fechaInicio: '2026-10-01',
    });
    expect(errores.map((e) => e.property)).toContain('fechaInicio');
  });
});

describe('CreateGastoRecurrenteDto', () => {
  const valido = {
    usuarioId: '7',
    monto: '1500.50',
    descripcion: 'Netflix',
    frecuencia: 'MENSUAL',
    diaMes: '15',
    activo: true,
  };

  it('normaliza los tipos y acepta un payload válido', async () => {
    const instancia = plainToInstance(CreateGastoRecurrenteDto, valido);
    expect(instancia.usuarioId).toBe(7);
    expect(instancia.monto).toBe(1500.5);
    expect(instancia.diaMes).toBe(15);
    await expect(validar(CreateGastoRecurrenteDto, valido)).resolves.toHaveLength(0);
  });

  it('rechaza una frecuencia desconocida y un día fuera de rango', async () => {
    const errores = await validar(CreateGastoRecurrenteDto, {
      ...valido,
      frecuencia: 'QUINCENAL',
      diaSemana: '9',
    });
    const props = errores.map((e) => e.property);
    expect(props).toContain('frecuencia');
    expect(props).toContain('diaSemana');
  });
});

describe('UpdateGastoRecurrenteDto', () => {
  it('admite una actualización parcial', async () => {
    await expect(validar(UpdateGastoRecurrenteDto, { monto: '2000' })).resolves.toHaveLength(0);
  });
});

describe('CreatePresupuestoDto', () => {
  const valido = {
    telegramId: '123',
    categoriaId: 1,
    monto: 50000,
    mes: 11,
    anio: 2026,
  };

  it('acepta un presupuesto válido', async () => {
    await expect(validar(CreatePresupuestoDto, valido)).resolves.toHaveLength(0);
  });

  it('rechaza mes y año inválidos', async () => {
    const errores = await validar(CreatePresupuestoDto, {
      ...valido,
      mes: 13,
      anio: 1999,
    });
    const props = errores.map((e) => e.property);
    expect(props).toContain('mes');
    expect(props).toContain('anio');
  });
});
