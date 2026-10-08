import { beforeEach, describe, expect, it } from 'vitest';
import {
  INDICE_KEY, LEGADO_KEY, MAX_PLANOS, carregarPlano, chavePlano, criarPlano, duplicarPlano, excluirPlano, gerarBackup,
  importarBackup, inicializar, lerIndice, listarPlanos, restaurarPlano, salvarPlano,
} from '@/lib/armazenamento';

function memoria() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    get length() { return m.size; },
  };
}

beforeEach(() => { globalThis.window = { localStorage: memoria() }; });

describe('inicializar', () => {
  it('cria o primeiro plano', () => {
    const { id, state, disponivel } = inicializar();
    expect(disponivel).toBe(true);
    expect(state.titulo).toBe('Meu plano');
    expect(lerIndice()).toEqual({ ativo: id, ids: [id] });
  });

  it('migra o formato v1 e remove a chave antiga', () => {
    window.localStorage.setItem(LEGADO_KEY, JSON.stringify({ versao: 1, nome: 'Ana', radar: { interesse: { texto: 'x', nota: 3 } } }));
    const { state } = inicializar();
    expect(state.nome).toBe('Ana');
    expect(state.titulo).toBe('Meu plano');
    expect(window.localStorage.getItem(LEGADO_KEY)).toBeNull();
    expect(lerIndice().ids).toHaveLength(1);
  });

  it('ignora ids órfãos e índice corrompido', () => {
    window.localStorage.setItem(INDICE_KEY, '{"ids":["fantasma", 3],"ativo":"fantasma"}');
    const { id } = inicializar();
    expect(lerIndice()).toEqual({ ativo: id, ids: [id] });
  });

  it('funciona sem localStorage', () => {
    globalThis.window = {};
    const { state, disponivel } = inicializar();
    expect(disponivel).toBe(false);
    expect(state.versao).toBe(2);
  });
});

describe('vários planos', () => {
  it('cria, duplica, lista, exclui e desfaz', () => {
    const { id: a } = inicializar();
    salvarPlano(a, { ...carregarPlano(a), cargoAlvo: 'Dados' });
    const b = criarPlano();
    expect(b.state.titulo).toBe('Plano 2');
    const c = duplicarPlano(a);
    expect(c.state.titulo).toBe('Meu plano (cópia)');
    expect(c.state.cargoAlvo).toBe('Dados');
    expect(listarPlanos().map((p) => p.id)).toEqual([a, b.id, c.id]);

    const desfazer = excluirPlano(b.id);
    expect(window.localStorage.getItem(chavePlano(b.id))).toBeNull();
    expect(lerIndice().ids).toEqual([a, c.id]);
    restaurarPlano(desfazer);
    expect(lerIndice().ids).toEqual([a, b.id, c.id]);
    expect(lerIndice().ativo).toBe(b.id);
  });

  it('respeita o limite de planos', () => {
    inicializar();
    for (let i = 1; i < MAX_PLANOS; i++) expect(criarPlano()).not.toBeNull();
    expect(criarPlano()).toBeNull();
  });
});

describe('backup', () => {
  it('exporta e importa todos os planos como novos', () => {
    const { id } = inicializar();
    salvarPlano(id, { ...carregarPlano(id), nome: 'Ana', ui: { passo: 5, preenchido: false, sugeridos: {} } });
    const backup = JSON.parse(JSON.stringify(gerarBackup()));
    expect(backup.planos).toHaveLength(1);

    const { criados } = importarBackup(backup);
    expect(criados).toHaveLength(1);
    expect(criados[0].id).not.toBe(id);
    expect(criados[0].state.nome).toBe('Ana');
    expect(criados[0].state.ui.passo).toBe(0);
    expect(criados[0].state.titulo).toBe('Meu plano (importado)');
    expect(lerIndice().ids).toHaveLength(2);
  });

  it('aceita um plano avulso e rejeita arquivos estranhos', () => {
    inicializar();
    expect(importarBackup({ nome: 'Bia', radar: {} }).criados[0].state.nome).toBe('Bia');
    expect(() => importarBackup({ foo: 1 })).toThrow(/não reconhecido/);
    expect(() => importarBackup(null)).toThrow();
    expect(() => importarBackup({ app: 'wmc-plano-carreira', planos: [1, 'x'] })).toThrow(/Nenhum plano/);
  });
});
