import { describe, expect, it } from 'vitest';
import { estadoInicial } from '@/lib/data';
import { setPath } from '@/lib/state';
import { progressoGeral, statusEtapa } from '@/lib/progresso';

describe('progresso', () => {
  it('estado novo está vazio em todas as etapas', () => {
    const s = estadoInicial();
    ['inicio', 'radar', 'hoje', 'gap', 'acao', 'matriz', 'experimento', 'plano'].forEach((id) => {
      expect(statusEtapa(s, id)).toBe('vazio');
    });
    expect(progressoGeral(s)).toBe(0);
  });

  it('distingue parcial de completo', () => {
    let s = setPath(estadoInicial(), 'hoje.situacao', 'Analista');
    expect(statusEtapa(s, 'hoje')).toBe('parcial');
    s = setPath(setPath(s, 'hoje.tenho', 'x'), 'hoje.falta', 'y');
    expect(statusEtapa(s, 'hoje')).toBe('completo');
    expect(statusEtapa(setPath(s, 'radar.interesse.nota', 3), 'radar')).toBe('parcial');
    expect(progressoGeral(s)).toBeGreaterThan(0);
  });
});
