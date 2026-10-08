import { describe, expect, it } from 'vitest';
import { formatarData, hojeLocal, semanasDe, semanasDiario, somarDias } from '@/lib/datas';

describe('hojeLocal', () => {
  it('usa o dia local, não o UTC', () => {
    // 23:59 no fuso local continua sendo o mesmo dia.
    expect(hojeLocal(new Date(2026, 9, 8, 23, 59))).toBe('2026-10-08');
    expect(hojeLocal(new Date(2026, 9, 8, 21, 30))).toBe('2026-10-08');
    expect(hojeLocal(new Date(2026, 9, 9, 0, 0))).toBe('2026-10-09');
  });
});

describe('somarDias e formatarData', () => {
  it('atravessa meses e anos', () => {
    expect(somarDias('2026-12-28', 7)).toBe('2027-01-04');
    expect(formatarData('2026-10-08')).toBe('08/10/2026');
    expect(somarDias('inválida', 3)).toBe('');
  });
});

describe('semanasDe', () => {
  it.each([
    ['2 semanas', 2], ['1 mês', 4], ['um mes', 4], ['2 meses', 8], ['15 dias', 3], ['10 dias', 2],
    ['uma semana', 1], ['3 SEMANAS', 3], ['', 2], ['algum tempo', 2], ['6 meses', 8], ['1,5 semana', 2],
  ])('"%s" → %i', (texto, esperado) => expect(semanasDe(texto)).toBe(esperado));
});

describe('semanasDiario', () => {
  it('começa no início do experimento ou na data da mentoria', () => {
    expect(semanasDiario({ duracao: '2 semanas' }, '2026-10-08')).toEqual([
      { n: 1, inicio: '2026-10-08', fim: '2026-10-14' },
      { n: 2, inicio: '2026-10-15', fim: '2026-10-21' },
    ]);
    expect(semanasDiario({ duracao: '1 semana', inicio: '2026-11-02' }, '2026-10-08')[0].inicio).toBe('2026-11-02');
  });
});
