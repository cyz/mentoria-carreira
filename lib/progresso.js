/* Quanto de cada etapa já foi preenchido, para o stepper e a lista de planos. */
import { CADEIA, DIMENSOES, FASES, GAPS, PLANO_CAMPOS, PROXIMO } from './data';

const ok = (v) => !!String(v ?? '').trim();
const contar = (valores) => ({ feitos: valores.filter(Boolean).length, total: valores.length });

const REGRAS = {
  // A data já vem preenchida, então só o nome indica que a etapa foi feita.
  inicio: (s) => contar([ok(s.nome)]),
  radar: (s) => contar([
    ...DIMENSOES.map((d) => ok(s.radar[d.id].texto)),
    ...DIMENSOES.map((d) => !!s.radar[d.id].nota),
    ok(s.direcao),
  ]),
  hoje: (s) => contar([ok(s.hoje.situacao), ok(s.hoje.tenho), ok(s.hoje.falta)]),
  gap: (s) => contar([
    ok(s.cargoAlvo),
    ...s.vagas.map((v) => ok(v.titulo) || ok(v.requisitos)),
    ok(s.recorrentes),
    ...s.prioridades.map(ok),
    ...GAPS.map((g) => ok(s.gap[g.id])),
  ]),
  acao: (s) => contar([...CADEIA.map((c) => ok(s.cadeia[c.id])), ...FASES.map((f) => s.fases[f.id].length > 0)]),
  matriz: (s) => (s.matriz.length
    ? contar(s.matriz.map((m) => ok(m.acao)))
    : { feitos: 0, total: 1 }),
  experimento: (s) => contar(s.experimentos.flatMap((e) => [ok(e.area), ok(e.duracao), ok(e.acao)])),
  plano: (s) => contar([...PLANO_CAMPOS.map((p) => ok(s.plano[p.id])), ...PROXIMO.map((p) => ok(s.proximo[p.id]))]),
};

export const ETAPAS_COM_PROGRESSO = Object.keys(REGRAS);

export function progressoEtapa(state, id) {
  const regra = REGRAS[id];
  return regra ? regra(state) : { feitos: 0, total: 0 };
}

/* 'completo' | 'parcial' | 'vazio' */
export function statusEtapa(state, id) {
  const { feitos, total } = progressoEtapa(state, id);
  if (!total || !feitos) return 'vazio';
  return feitos >= total ? 'completo' : 'parcial';
}

/* Média das etapas (cada etapa pesa igual), de 0 a 100. */
export function progressoGeral(state) {
  const fracoes = ETAPAS_COM_PROGRESSO.map((id) => {
    const { feitos, total } = progressoEtapa(state, id);
    return total ? feitos / total : 0;
  });
  return Math.round((fracoes.reduce((a, b) => a + b, 0) / fracoes.length) * 100);
}
