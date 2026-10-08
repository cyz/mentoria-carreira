/* Regras puras do estado de um plano: migração, saneamento e sugestões do one-pager. */
import {
  CADEIA, DIMENSOES, GAPS, PLANO_CAMPOS, PROXIMO, VERSAO, estadoInicial, novaVaga, novoExperimento, sugestoesPlano,
} from './data';

export const MAX_EXPERIMENTOS = 3;

const texto = (v) => (typeof v === 'string' ? v : '');
const inteiroEntre = (v, min, max, padrao) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : padrao;
};
const objeto = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const lista = (v) => (Array.isArray(v) ? v : []);

/* Converte qualquer objeto salvo ou importado num estado válido da versão atual. */
export function migrar(salvo) {
  const s = objeto(salvo);
  const base = estadoInicial();
  const textos = (grupo, ids) => Object.fromEntries(ids.map((id) => [id, texto(objeto(s[grupo])[id])]));

  const radar = {};
  DIMENSOES.forEach((d) => {
    const r = objeto(objeto(s.radar)[d.id]);
    radar[d.id] = { texto: texto(r.texto), nota: inteiroEntre(r.nota, 1, 5, null) };
  });

  const vagas = lista(s.vagas).slice(0, 5).map((v) => ({ titulo: texto(objeto(v).titulo), requisitos: texto(objeto(v).requisitos) }));
  while (vagas.length < 5) vagas.push(novaVaga());

  const prioridades = lista(s.prioridades).slice(0, 3).map(texto);
  while (prioridades.length < 3) prioridades.push('');

  const fases = {};
  Object.keys(base.fases).forEach((f) => {
    const vistos = new Set();
    fases[f] = lista(objeto(s.fases)[f]).map((t) => texto(t).trim()).filter((t) => {
      const k = t.toLowerCase();
      if (!t || vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
  });

  const matriz = lista(s.matriz).map((m) => ({
    acao: texto(objeto(m).acao),
    impacto: inteiroEntre(objeto(m).impacto, 1, 4, 3),
    esforco: inteiroEntre(objeto(m).esforco, 1, 4, 2),
  }));

  const experimentos = lista(s.experimentos).slice(0, MAX_EXPERIMENTOS).map((e) => ({
    ...novoExperimento(),
    area: texto(objeto(e).area),
    duracao: texto(objeto(e).duracao),
    inicio: /^\d{4}-\d{2}-\d{2}$/.test(objeto(e).inicio) ? objeto(e).inicio : '',
    acao: texto(objeto(e).acao),
  }));
  if (!experimentos.length) experimentos.push(novoExperimento());

  const ui = objeto(s.ui);
  const sugeridos = Object.fromEntries(Object.entries(objeto(ui.sugeridos)).filter(([, v]) => typeof v === 'string'));

  return {
    versao: VERSAO,
    titulo: texto(s.titulo),
    nome: texto(s.nome),
    data: /^\d{4}-\d{2}-\d{2}$/.test(s.data) ? s.data : base.data,
    radar,
    direcao: texto(s.direcao),
    hoje: textos('hoje', Object.keys(base.hoje)),
    cargoAlvo: texto(s.cargoAlvo),
    vagas,
    recorrentes: texto(s.recorrentes),
    prioridades,
    gap: textos('gap', GAPS.map((g) => g.id)),
    cadeia: textos('cadeia', CADEIA.map((c) => c.id)),
    fases,
    matriz,
    experimentos,
    plano: textos('plano', PLANO_CAMPOS.map((p) => p.id)),
    proximo: textos('proximo', PROXIMO.map((p) => p.id)),
    ui: { passo: inteiroEntre(ui.passo, 0, 99, 0), preenchido: ui.preenchido === true, sugeridos },
    ...(Number.isFinite(s.atualizadoEm) ? { atualizadoEm: s.atualizadoEm } : {}),
  };
}

export function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

/* Atualização imutável por caminho "a.b.0.c". */
export function setPath(obj, path, value) {
  const [k, ...rest] = Array.isArray(path) ? path : path.split('.');
  const copia = Array.isArray(obj) ? [...obj] : { ...obj };
  copia[k] = rest.length ? setPath(obj[k], rest, value) : value;
  return copia;
}

const GRUPOS_PLANO = ['plano', 'proximo'];
const vazio = (v) => !String(v || '').trim();

/* Preenche campos vazios do one-pager com as respostas das etapas anteriores e guarda a origem usada. */
export function preencherVazios(state) {
  const sug = sugestoesPlano(state);
  let n = 0;
  const novo = { ...state, plano: { ...state.plano }, proximo: { ...state.proximo } };
  const sugeridos = { ...state.ui.sugeridos };
  GRUPOS_PLANO.forEach((grupo) => {
    Object.entries(sug[grupo]).forEach(([k, v]) => {
      if (vazio(novo[grupo][k]) && v) {
        novo[grupo][k] = v;
        sugeridos[`${grupo}.${k}`] = v;
        n++;
      }
    });
  });
  return { state: { ...novo, ui: { ...state.ui, sugeridos } }, n };
}

/* Campos do one-pager cuja resposta de origem mudou depois de terem sido preenchidos. */
export function camposDesatualizados(state) {
  const sug = sugestoesPlano(state);
  const out = [];
  GRUPOS_PLANO.forEach((grupo) => {
    Object.entries(sug[grupo]).forEach(([k, nova]) => {
      const path = `${grupo}.${k}`;
      const usada = state.ui.sugeridos[path];
      if (usada !== undefined && nova && nova !== usada && state[grupo][k] !== nova) out.push({ path, nova });
    });
  });
  return out;
}

/* Aplica (ou apenas dispensa) as novas sugestões nos caminhos indicados. */
export function resolverDesatualizados(state, paths, aplicar) {
  const pendentes = camposDesatualizados(state).filter((c) => paths.includes(c.path));
  let novo = state;
  const sugeridos = { ...state.ui.sugeridos };
  pendentes.forEach(({ path, nova }) => {
    if (aplicar) novo = setPath(novo, path, nova);
    sugeridos[path] = nova;
  });
  return { ...novo, ui: { ...novo.ui, sugeridos } };
}
