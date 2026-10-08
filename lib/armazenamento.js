/* Persistência no localStorage: vários planos, migração do formato v1 e backup em arquivo. */
import { estadoInicial, tituloDoPlano } from './data';
import { migrar } from './state';
import { progressoGeral } from './progresso';

export const LEGADO_KEY = 'wmc-plano-carreira-v1';
export const INDICE_KEY = 'wmc-carreira-v2';
export const PREFIXO_PLANO = 'wmc-carreira-v2:plano:';
export const APP_BACKUP = 'wmc-plano-carreira';
export const MAX_PLANOS = 20;

export const chavePlano = (id) => PREFIXO_PLANO + id;

function storage() {
  try { return window.localStorage; } catch { return null; }
}
function ler(chave) {
  try { return JSON.parse(storage()?.getItem(chave) || 'null'); } catch { return null; }
}
function gravar(chave, valor) {
  try {
    const ls = storage();
    if (!ls) return false;
    ls.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false; // indisponível (modo privado) ou cheio
  }
}
function remover(chave) {
  try { storage()?.removeItem(chave); } catch { /* ignore */ }
}

export function novoId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function lerIndice() {
  const i = ler(INDICE_KEY);
  const ids = Array.isArray(i?.ids) ? [...new Set(i.ids.filter((x) => typeof x === 'string' && x))] : [];
  return { ativo: typeof i?.ativo === 'string' ? i.ativo : null, ids };
}

function gravarIndice(indice) {
  return gravar(INDICE_KEY, indice);
}

export function carregarPlano(id) {
  const salvo = ler(chavePlano(id));
  return salvo ? migrar(salvo) : null;
}

export function salvarPlano(id, state) {
  return gravar(chavePlano(id), { ...state, atualizadoEm: Date.now() });
}

export function definirAtivo(id) {
  const indice = lerIndice();
  if (indice.ids.includes(id)) gravarIndice({ ...indice, ativo: id });
}

function adicionarAoIndice(id, ativar = true) {
  const indice = lerIndice();
  gravarIndice({ ids: [...indice.ids.filter((x) => x !== id), id], ativo: ativar ? id : indice.ativo });
}

/* Migra o formato antigo, garante pelo menos um plano e devolve o plano ativo. */
export function inicializar() {
  const indice = lerIndice();
  indice.ids = indice.ids.filter((id) => ler(chavePlano(id)));

  const legado = ler(LEGADO_KEY);
  if (legado && typeof legado === 'object') {
    const id = novoId();
    if (gravar(chavePlano(id), migrar({ ...legado, titulo: legado.titulo || 'Meu plano' }))) {
      indice.ids.unshift(id);
      indice.ativo = id;
      remover(LEGADO_KEY);
    }
  }

  if (!indice.ids.length) {
    const id = novoId();
    if (gravar(chavePlano(id), estadoInicial({ titulo: 'Meu plano' }))) indice.ids.push(id);
    else return { id, state: estadoInicial({ titulo: 'Meu plano' }), disponivel: false };
  }
  if (!indice.ids.includes(indice.ativo)) indice.ativo = indice.ids[0];
  gravarIndice(indice);
  return { id: indice.ativo, state: carregarPlano(indice.ativo) || estadoInicial(), disponivel: true };
}

export function listarPlanos() {
  return lerIndice().ids.map((id) => {
    const s = carregarPlano(id);
    if (!s) return null;
    return {
      id,
      titulo: tituloDoPlano(s),
      nome: s.nome,
      cargoAlvo: s.cargoAlvo,
      atualizadoEm: s.atualizadoEm,
      progresso: progressoGeral(s),
    };
  }).filter(Boolean);
}

export const podeCriarPlano = () => lerIndice().ids.length < MAX_PLANOS;

export function criarPlano(base) {
  if (!podeCriarPlano()) return null;
  const id = novoId();
  const n = lerIndice().ids.length + 1;
  const state = base ? migrar(base) : estadoInicial({ titulo: `Plano ${n}` });
  if (!salvarPlano(id, state)) return null;
  adicionarAoIndice(id);
  return { id, state };
}

export function duplicarPlano(id) {
  const origem = carregarPlano(id);
  if (!origem) return null;
  return criarPlano({ ...origem, titulo: `${tituloDoPlano(origem)} (cópia)`, ui: { ...origem.ui, passo: 0 } });
}

/* Exclui o plano e devolve o que é preciso para desfazer. */
export function excluirPlano(id) {
  const indice = lerIndice();
  const posicao = indice.ids.indexOf(id);
  const state = carregarPlano(id);
  remover(chavePlano(id));
  const ids = indice.ids.filter((x) => x !== id);
  gravarIndice({ ids, ativo: indice.ativo === id ? ids[0] || null : indice.ativo });
  return { id, state, posicao };
}

export function restaurarPlano({ id, state, posicao }) {
  if (!state || !gravar(chavePlano(id), state)) return false;
  const indice = lerIndice();
  const ids = indice.ids.filter((x) => x !== id);
  ids.splice(Math.max(0, Math.min(posicao, ids.length)), 0, id);
  gravarIndice({ ids, ativo: id });
  return true;
}

export function gerarBackup() {
  const planos = lerIndice().ids.map((id) => carregarPlano(id)).filter(Boolean);
  return { app: APP_BACKUP, versao: 2, exportadoEm: new Date().toISOString(), planos };
}

const pareceUmPlano = (p) => p && typeof p === 'object' && !Array.isArray(p)
  && ['radar', 'plano', 'vagas', 'fases', 'hoje'].some((k) => k in p);

/* Aceita um backup completo ou um plano avulso. Cada plano importado vira um plano novo. */
export function importarBackup(dados) {
  let planos;
  if (dados && dados.app === APP_BACKUP && Array.isArray(dados.planos)) planos = dados.planos;
  else if (pareceUmPlano(dados)) planos = [dados];
  else throw new Error('Arquivo não reconhecido como backup do plano de carreira.');

  const validos = planos.filter(pareceUmPlano);
  if (!validos.length) throw new Error('Nenhum plano encontrado no arquivo.');
  const vagas = MAX_PLANOS - lerIndice().ids.length;
  if (vagas <= 0) throw new Error(`Você já tem ${MAX_PLANOS} planos. Exclua algum para importar.`);

  const existentes = new Set(listarPlanos().map((p) => p.titulo));
  const criados = validos.slice(0, vagas).map((p) => {
    const titulo = tituloDoPlano(p);
    return criarPlano({ ...p, titulo: existentes.has(titulo) ? `${titulo} (importado)` : p.titulo, ui: { ...p.ui, passo: 0 } });
  }).filter(Boolean);
  if (!criados.length) throw new Error('Não foi possível salvar neste navegador.');
  return { criados, ignorados: validos.length - criados.length };
}
