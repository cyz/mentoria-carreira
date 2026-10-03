import { estadoInicial, sugestoesPlano } from './data';

export const STORAGE_KEY = 'wmc-plano-carreira-v1';

/* Mescla o estado salvo sobre o inicial, para tolerar versões antigas do formato. */
function mesclar(base, salvo) {
  if (Array.isArray(base)) return Array.isArray(salvo) ? salvo : base;
  if (base && typeof base === 'object') {
    const out = { ...base };
    if (salvo && typeof salvo === 'object') {
      Object.keys(salvo).forEach((k) => { out[k] = k in base ? mesclar(base[k], salvo[k]) : salvo[k]; });
    }
    return out;
  }
  return salvo === undefined || salvo === null ? base : salvo;
}

export function carregarEstado() {
  try {
    const salvo = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    return salvo ? mesclar(estadoInicial(), salvo) : estadoInicial();
  } catch {
    return estadoInicial();
  }
}

export function salvarEstado(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false; // armazenamento indisponível (ex.: modo privado)
  }
}

export function limparEstado() {
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
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

/* Preenche campos vazios do one-pager com as respostas das etapas anteriores. */
export function preencherVazios(state) {
  const sug = sugestoesPlano(state);
  let n = 0;
  const novo = { ...state, plano: { ...state.plano }, proximo: { ...state.proximo } };
  ['plano', 'proximo'].forEach((grupo) => {
    Object.entries(sug[grupo]).forEach(([k, v]) => {
      if (!String(novo[grupo][k] || '').trim() && v) { novo[grupo][k] = v; n++; }
    });
  });
  return { state: novo, n };
}
