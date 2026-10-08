import { describe, expect, it } from 'vitest';
import { estadoInicial, sugestoesPlano } from '@/lib/data';
import {
  camposDesatualizados, migrar, preencherVazios, resolverDesatualizados, setPath,
} from '@/lib/state';

describe('migrar', () => {
  it('converte um estado v1 preservando as respostas', () => {
    const v1 = {
      versao: 1, nome: 'Ana', data: '2026-10-01', radar: { interesse: { texto: 'dados', nota: 4 } },
      fases: { d30: ['Estudar SQL', 'estudar sql', ''] }, ui: { passo: 3, preenchido: true },
    };
    const s = migrar(v1);
    expect(s.versao).toBe(2);
    expect(s.nome).toBe('Ana');
    expect(s.radar.interesse).toEqual({ texto: 'dados', nota: 4 });
    expect(s.radar.valores.nota).toBeNull();
    expect(s.fases.d30).toEqual(['Estudar SQL']);
    expect(s.fases.d60).toEqual([]);
    expect(s.ui).toEqual({ passo: 3, preenchido: true, sugeridos: {} });
    expect(s.experimentos).toEqual([{ area: '', duracao: '', inicio: '', acao: '' }]);
  });

  it('descarta tipos inválidos vindos de arquivos importados', () => {
    const s = migrar({
      nome: 42, radar: { interesse: { nota: 9 } }, vagas: 'x', prioridades: [1, 'Python'],
      matriz: [{ acao: 'A', impacto: 7, esforco: '2' }, null], experimentos: new Array(10).fill({ area: 'X' }),
      ui: { sugeridos: { 'plano.gap': 'ok', 'plano.x': 3 } }, data: '08/10/2026',
    });
    expect(s.nome).toBe('');
    expect(s.radar.interesse.nota).toBeNull();
    expect(s.vagas).toHaveLength(5);
    expect(s.prioridades).toEqual(['', 'Python', '']);
    expect(s.matriz).toEqual([{ acao: 'A', impacto: 3, esforco: 2 }, { acao: '', impacto: 3, esforco: 2 }]);
    expect(s.experimentos).toHaveLength(3);
    expect(s.ui.sugeridos).toEqual({ 'plano.gap': 'ok' });
    expect(s.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('é idempotente', () => {
    const s = migrar(estadoInicial({ nome: 'Bia' }));
    expect(migrar(s)).toEqual(s);
  });
});

describe('one-pager desatualizado', () => {
  const base = () => {
    let s = estadoInicial();
    s = setPath(s, 'radar.valores.texto', 'flexibilidade');
    s = setPath(s, 'cargoAlvo', 'Analista de dados');
    return s;
  };

  it('preenche vazios e registra a origem', () => {
    const { state, n } = preencherVazios(base());
    expect(n).toBe(2);
    expect(state.plano.valorizo).toBe('flexibilidade');
    expect(state.ui.sugeridos['plano.valorizo']).toBe('flexibilidade');
    expect(camposDesatualizados(state)).toEqual([]);
  });

  it('detecta quando a resposta de origem muda e permite atualizar ou manter', () => {
    let { state } = preencherVazios(base());
    state = setPath(state, 'radar.valores.texto', 'aprendizado');
    expect(camposDesatualizados(state)).toEqual([{ path: 'plano.valorizo', nova: 'aprendizado' }]);

    const atualizado = resolverDesatualizados(state, ['plano.valorizo'], true);
    expect(atualizado.plano.valorizo).toBe('aprendizado');
    expect(camposDesatualizados(atualizado)).toEqual([]);

    const mantido = resolverDesatualizados(state, ['plano.valorizo'], false);
    expect(mantido.plano.valorizo).toBe('flexibilidade');
    expect(camposDesatualizados(mantido)).toEqual([]);
  });

  it('não avisa sobre campos escritos à mão', () => {
    let s = setPath(base(), 'plano.valorizo', 'escrevi eu');
    s = preencherVazios(s).state;
    s = setPath(s, 'radar.valores.texto', 'outro');
    expect(camposDesatualizados(s).map((c) => c.path)).not.toContain('plano.valorizo');
    expect(sugestoesPlano(s).plano.valorizo).toBe('outro');
  });
});
