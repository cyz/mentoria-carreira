/* Conteúdo da mentoria e regras compartilhadas entre o app, o PDF e o Markdown. */
import { hojeLocal } from './datas';

export const VERSAO = 2;

export const BRAND = {
  pink: '#ff609a',
  pinkSoft: '#fff0f5',
  black: '#0b0b0b',
  dark: '#16181b',
  gray: { 50: '#f6f6f8', 100: '#eeeef1', 200: '#e3e4e8', 300: '#bbbdc9', 400: '#9499ad', 500: '#727892', 600: '#515870', 700: '#383d51' },
  // Cores da borboleta da WoMakersCode, de cima para baixo
  butterfly: ['#bbcb30', '#f9dd15', '#e19e2c', '#d77e2b', '#ce5a2d', '#c62c30', '#c6195b', '#a41064'],
};

export const DIMENSOES = [
  { id: 'interesse', nome: 'Interesse', pergunta: 'O que eu gosto de fazer?', placeholder: 'Ex.: resolver problemas com dados, ensinar, criar interfaces, organizar processos…' },
  { id: 'competencia', nome: 'Competência', pergunta: 'No que eu sou boa hoje?', placeholder: 'Ex.: comunicação, análise, Excel avançado, atendimento, liderança de projetos…' },
  { id: 'valores', nome: 'Valores', pergunta: 'O que é importante para mim?', placeholder: 'Ex.: flexibilidade, propósito, aprendizado, estabilidade, reconhecimento…' },
  { id: 'contexto', nome: 'Contexto', pergunta: 'Em que ambiente quero trabalhar?', placeholder: 'Ex.: remoto, startup, empresa grande, time diverso, pouca hierarquia…' },
  { id: 'mercado', nome: 'Mercado', pergunta: 'Onde existem oportunidades?', placeholder: 'Ex.: muitas vagas de analista de dados júnior; empresas de saúde contratando…' },
];

export const GAPS = [
  { id: 'conhecimento', nome: 'Conhecimento', pergunta: 'O que preciso aprender?', placeholder: 'Ex.: SQL intermediário, fundamentos de UX…' },
  { id: 'experiencia', nome: 'Experiência', pergunta: 'O que preciso praticar?', placeholder: 'Ex.: conduzir entrevistas com usuários, montar dashboards…' },
  { id: 'evidencia', nome: 'Evidência', pergunta: 'Como vou provar que sei fazer?', placeholder: 'Ex.: case no portfólio, projeto no GitHub, certificação…' },
  { id: 'relacionamento', nome: 'Relacionamento', pergunta: 'Quem preciso conhecer?', placeholder: 'Ex.: 2 pessoas que já trabalham na área, comunidade X…' },
];

export const FASES = [
  { id: 'd30', titulo: 'Próximos 30 dias', foco: 'Aprender + explorar',
    exemplos: ['Estudar um assunto específico', 'Conversar com alguém da área', 'Fazer um curso curto', 'Participar de uma comunidade', 'Testar uma atividade'] },
  { id: 'd60', titulo: '60 dias', foco: 'Praticar',
    exemplos: ['Desenvolver um projeto', 'Participar de um desafio', 'Fazer trabalho voluntário', 'Contribuir com open source', 'Aplicar em uma atividade profissional'] },
  { id: 'd90', titulo: '90 dias', foco: 'Gerar evidência',
    exemplos: ['Montar portfólio', 'Publicar projeto no GitHub', 'Atualizar currículo', 'Escrever um case', 'Fazer candidaturas', 'Praticar entrevistas'] },
];

export const CADEIA = [
  { id: 'objetivo', nome: 'Objetivo', placeholder: 'Ex.: conseguir vaga de analista de dados júnior' },
  { id: 'gap', nome: 'Gap', placeholder: 'Ex.: não tenho projetos práticos de dados' },
  { id: 'acao', nome: 'Ação', placeholder: 'Ex.: criar 1 projeto com dados públicos' },
  { id: 'evidencia', nome: 'Evidência', placeholder: 'Ex.: projeto publicado no GitHub com README' },
  { id: 'prazo', nome: 'Prazo', placeholder: 'Ex.: até 15/12' },
];

export const NIVEIS = ['Baixo', 'Médio-baixo', 'Médio-alto', 'Alto'];

export const EXEMPLOS_MATRIZ = [
  { acao: 'Atualizar LinkedIn', impacto: 4, esforco: 1 },
  { acao: 'Fazer certificação', impacto: 3, esforco: 4 },
  { acao: 'Criar projeto', impacto: 4, esforco: 3 },
  { acao: 'Fazer mais 3 cursos', impacto: 2, esforco: 4 },
  { acao: 'Conversar com profissional da área', impacto: 4, esforco: 1 },
];

export const QUADRANTES = {
  agora: { titulo: 'Comece já', desc: 'Alto impacto · baixo esforço', cor: '#ff609a' },
  planeje: { titulo: 'Planeje', desc: 'Alto impacto · alto esforço', cor: '#e19e2c' },
  avalie: { titulo: 'Avalie se precisa mesmo', desc: 'Baixo impacto · baixo esforço', cor: '#9499ad' },
  depois: { titulo: 'Não priorize agora', desc: 'Baixo impacto · alto esforço', cor: '#515870' },
};

export function quadrante(item) {
  const alto = Number(item.impacto) >= 3;
  const facil = Number(item.esforco) <= 2;
  if (alto && facil) return 'agora';
  if (alto) return 'planeje';
  if (facil) return 'avalie';
  return 'depois';
}

export const EXEMPLOS_EXPERIMENTO = [
  { area: 'Product Management', duracao: '2 semanas', acao: 'conversar com duas pessoas que trabalham com Product Management' },
  { area: 'Dados', duracao: '3 semanas', acao: 'fazer um pequeno projeto de dados com uma base pública' },
  { area: 'UX', duracao: '1 mês', acao: 'participar de uma comunidade de UX e de 1 evento' },
];

export const REFLEXAO = [
  'Gostei?',
  'Tenho curiosidade de continuar?',
  'Consigo me imaginar fazendo isso profissionalmente?',
  'Quero aprofundar?',
];

/* Perguntas do diário semanal de cada experimento (preenchido no PDF ou no Markdown). */
export const DIARIO = [
  { id: 'fiz', pergunta: 'O que fiz nesta semana?' },
  { id: 'aprendi', pergunta: 'O que aprendi ou me surpreendeu?' },
  { id: 'proximo', pergunta: 'O que vou fazer na próxima semana?' },
];
export const DIARIO_ENERGIA = 'Minha energia com essa área (1 a 5)';

export const PLANO_CAMPOS = [
  { id: 'direcao', titulo: 'Minha direção', prompt: 'Quero me aproximar de…' },
  { id: 'valorizo', titulo: 'O que importa para mim', prompt: 'Eu valorizo…' },
  { id: 'competencias', titulo: 'O que já tenho', prompt: 'Minhas principais competências são…' },
  { id: 'gap', titulo: 'Meu principal gap', prompt: 'Preciso desenvolver…' },
  { id: 'prioridade', titulo: 'Minha prioridade', prompt: 'Nos próximos 30 dias, vou focar em…' },
  { id: 'experimento', titulo: 'Meu experimento', prompt: 'Vou testar…' },
  { id: 'evidencia', titulo: 'Minha evidência', prompt: 'Vou saber que avancei quando…' },
  { id: 'ajuda', titulo: 'Quem pode me ajudar', prompt: 'Vou conversar com…' },
  { id: 'naoPriorizar', titulo: 'O que não vou priorizar agora', prompt: 'Por enquanto, deixo de lado…' },
];

export const PROXIMO = [
  { id: 'vou', prompt: 'Nos próximos 30 dias, eu vou' },
  { id: 'desenvolver', prompt: 'Para desenvolver' },
  { id: 'avancei', prompt: 'Vou saber que avancei quando' },
];

export const novoExperimento = () => ({ area: '', duracao: '', inicio: '', acao: '' });
export const novaVaga = () => ({ titulo: '', requisitos: '' });

export function estadoInicial(extra = {}) {
  const radar = {};
  // nota null = ainda não avaliada (diferente de uma nota 3 escolhida).
  DIMENSOES.forEach((d) => { radar[d.id] = { texto: '', nota: null }; });
  const gap = {};
  GAPS.forEach((g) => { gap[g.id] = ''; });
  const cadeia = {};
  CADEIA.forEach((c) => { cadeia[c.id] = ''; });
  const plano = {};
  PLANO_CAMPOS.forEach((p) => { plano[p.id] = ''; });
  const proximo = {};
  PROXIMO.forEach((p) => { proximo[p.id] = ''; });
  return {
    versao: VERSAO,
    titulo: '',
    nome: '',
    data: hojeLocal(),
    radar,
    direcao: '',
    hoje: { situacao: '', tenho: '', falta: '' },
    cargoAlvo: '',
    vagas: Array.from({ length: 5 }, novaVaga),
    recorrentes: '',
    prioridades: ['', '', ''],
    gap,
    cadeia,
    fases: { d30: [], d60: [], d90: [] },
    matriz: [],
    experimentos: [novoExperimento()],
    plano,
    proximo,
    // sugeridos: valor que o one-pager recebeu de cada etapa, para avisar quando a origem mudar.
    ui: { passo: 0, preenchido: false, sugeridos: {} },
    ...extra,
  };
}

export const tituloDoPlano = (s) => String(s?.titulo || '').trim() || String(s?.cargoAlvo || '').trim() || 'Plano sem título';

export const slug = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function nomeArquivo(state, ext) {
  const titulo = slug(state.titulo);
  // Títulos padrão ("Meu plano", "Plano 2") não ajudam a identificar o arquivo.
  const partes = ['meu-plano-de-carreira', slug(state.nome), /^(meu-plano|plano-\d+)$/.test(titulo) ? '' : titulo];
  return `${partes.filter(Boolean).join('-').slice(0, 80)}.${ext}`;
}

export const notaTexto = (nota) => (nota ? `${nota}/5` : '–/5');

export const juntar = (lista, sep = '; ') => lista.map((s) => String(s || '').trim()).filter(Boolean).join(sep);

export function descreverExperimento(e) {
  if (!e || !(e.acao || e.area)) return '';
  const partes = [];
  if (e.duracao) partes.push(`Durante ${e.duracao.trim()},`);
  partes.push(e.acao ? `vou ${e.acao.trim()}` : `vou explorar ${e.area.trim()}`);
  let txt = partes.join(' ');
  if (e.area && e.acao && !e.acao.toLowerCase().includes(e.area.trim().toLowerCase())) txt += ` (${e.area.trim()})`;
  return txt.charAt(0).toUpperCase() + txt.slice(1) + (/[.!?]$/.test(txt) ? '' : '.');
}

/* Sugestões para o one-pager a partir das respostas anteriores. */
export function sugestoesPlano(s) {
  return {
    plano: {
      direcao: s.direcao || s.cargoAlvo,
      valorizo: s.radar.valores.texto,
      competencias: s.hoje.tenho || s.radar.competencia.texto,
      gap: juntar(s.prioridades, ', ') || s.hoje.falta,
      prioridade: juntar(s.fases.d30),
      experimento: juntar(s.experimentos.map(descreverExperimento), ' '),
      evidencia: s.cadeia.evidencia || juntar(s.fases.d90),
      ajuda: s.gap.relacionamento,
      naoPriorizar: juntar(s.matriz.filter((m) => m.acao && quadrante(m) === 'depois').map((m) => m.acao)),
    },
    proximo: {
      vou: s.cadeia.acao || s.fases.d30[0] || '',
      desenvolver: s.cadeia.gap || s.prioridades.find(Boolean) || '',
      avancei: s.cadeia.evidencia || '',
    },
  };
}
