/* Exportação do plano em Markdown (compatível com GitHub e Notion). */
import {
  CADEIA, DIARIO, DIARIO_ENERGIA, DIMENSOES, FASES, GAPS, NIVEIS, PLANO_CAMPOS, PROXIMO, QUADRANTES, REFLEXAO,
  descreverExperimento, notaTexto, quadrante,
} from './data';
import { formatarCurta, formatarData, semanasDiario } from './datas';

const limpo = (s) => String(s ?? '').replace(/\r/g, '').trim();
/* Texto livre em parágrafo: preserva quebras de linha do Markdown. */
const paragrafo = (s, vazio = '_(em branco)_') => limpo(s).split('\n').map((l) => l.trimEnd()).join('  \n') || vazio;
/* Célula de tabela: sem quebras nem barras verticais. */
const celula = (s) => limpo(s).replace(/\|/g, '\\|').replace(/\n+/g, '<br>') || '–';

export function gerarMarkdown(state) {
  const s = state;
  const out = [];
  const add = (...linhas) => out.push(...linhas);

  add('# Meu Plano de Carreira', '');
  const meta = [limpo(s.nome) && `**${limpo(s.nome)}**`, formatarData(s.data)].filter(Boolean).join(' · ');
  if (meta) add(meta, '');
  add('> Você não precisa ter todas as respostas. Precisa saber qual é o próximo passo.', '');

  add('## Meu plano em uma página', '');
  PLANO_CAMPOS.forEach((p, i) => {
    add(`### ${String(i + 1).padStart(2, '0')} · ${p.titulo}`, `_${p.prompt}_`, '', paragrafo(s.plano[p.id]), '');
  });
  add('### Meu próximo passo', '');
  PROXIMO.forEach((p) => add(`- **${p.prompt}…** ${paragrafo(s.proximo[p.id], '______').replace(/ {2}\n/g, ' ')}`));
  add('');

  const temRadar = DIMENSOES.some((d) => limpo(s.radar[d.id].texto) || s.radar[d.id].nota) || limpo(s.direcao);
  if (temRadar) {
    add('## 01 · Radar de carreira', '', '| Dimensão | Pergunta | Clareza | Minha resposta |', '| --- | --- | :---: | --- |');
    DIMENSOES.forEach((d) => add(`| **${d.nome}** | ${d.pergunta} | ${notaTexto(s.radar[d.id].nota)} | ${celula(s.radar[d.id].texto)} |`));
    add('', `**Minha direção:** ${paragrafo(s.direcao)}`, '');
  }

  if (limpo(s.hoje.situacao) || limpo(s.hoje.tenho) || limpo(s.hoje.falta)) {
    add('## Onde estou hoje', '');
    if (limpo(s.hoje.situacao)) add(`**Meu momento atual:** ${paragrafo(s.hoje.situacao)}`, '');
    add('**O que eu já tenho**', '', paragrafo(s.hoje.tenho), '', '**O que está faltando**', '', paragrafo(s.hoje.falta), '');
  }

  const vagas = s.vagas.filter((v) => limpo(v.titulo) || limpo(v.requisitos));
  const prioridades = s.prioridades.map(limpo).filter(Boolean);
  const temGap = limpo(s.cargoAlvo) || vagas.length || limpo(s.recorrentes) || prioridades.length || GAPS.some((g) => limpo(s.gap[g.id]));
  if (temGap) {
    add('## 02 · Career Gap', '');
    add(`**Onde estou:** ${paragrafo(s.hoje.situacao)}  `, `**Onde quero chegar:** ${paragrafo(s.cargoAlvo)}`, '');
    if (vagas.length) {
      add('### Vagas analisadas', '', '| # | Cargo · empresa | Principais requisitos |', '| :---: | --- | --- |');
      vagas.forEach((v, i) => add(`| ${i + 1} | ${celula(v.titulo)} | ${celula(v.requisitos)} |`));
      add('');
    }
    add('### O que aparece repetidamente', '', paragrafo(s.recorrentes), '');
    if (prioridades.length) {
      add('### Minhas 3 competências prioritárias', '');
      prioridades.forEach((p, i) => add(`${i + 1}. ${p}`));
      add('');
    }
    add('### Meu gap em 4 dimensões', '');
    GAPS.forEach((g) => add(`- **${g.nome}** (${g.pergunta}) ${paragrafo(s.gap[g.id], '–').replace(/ {2}\n/g, '; ')}`));
    add('');
  }

  const temCadeia = CADEIA.some((c) => limpo(s.cadeia[c.id]));
  const temFases = FASES.some((f) => s.fases[f.id].length);
  if (temCadeia || temFases) {
    add('## 03 · 30-60-90', '');
    if (temCadeia) {
      add(`| ${CADEIA.map((c) => c.nome).join(' | ')} |`, `| ${CADEIA.map(() => '---').join(' | ')} |`);
      add(`| ${CADEIA.map((c) => celula(s.cadeia[c.id])).join(' | ')} |`, '');
    }
    FASES.forEach((f) => {
      add(`### ${f.titulo} · ${f.foco}`, '');
      if (s.fases[f.id].length) s.fases[f.id].forEach((t) => add(`- [ ] ${limpo(t)}`));
      else add('- [ ] ');
      add('');
    });
  }

  const itensMx = s.matriz.map((m, i) => ({ ...m, n: i + 1 })).filter((m) => limpo(m.acao));
  if (itensMx.length) {
    add('## 04 · Matriz Impacto × Esforço', '');
    Object.entries(QUADRANTES).forEach(([k, q]) => {
      const doQuadrante = itensMx.filter((m) => quadrante(m) === k);
      add(`### ${q.titulo}`, `_${q.desc}_`, '');
      if (doQuadrante.length) {
        doQuadrante.forEach((m) => add(`- ${limpo(m.acao)} (impacto ${NIVEIS[m.impacto - 1].toLowerCase()}, esforço ${NIVEIS[m.esforco - 1].toLowerCase()})`));
      } else add('- –');
      add('');
    });
  }

  const exps = s.experimentos.filter((e) => limpo(e.area) || limpo(e.acao));
  if (exps.length) {
    add('## 05 · Experimentos de carreira', '', '> Você não precisa decidir. Você pode testar.', '');
    exps.forEach((e, i) => {
      const semanas = semanasDiario(e, s.data);
      add(`### Experimento ${i + 1}${limpo(e.area) ? ` · ${limpo(e.area)}` : ''}`, '', descreverExperimento(e), '');
      add('#### Diário semanal', '', '_Reserve 10 minutos por semana para registrar o que viveu. Pequenas anotações viram evidências._', '');
      semanas.forEach((sem) => {
        add(`##### Semana ${sem.n} · ${formatarCurta(sem.inicio)} a ${formatarCurta(sem.fim)}`, '');
        DIARIO.forEach((d) => add(`- **${d.pergunta}** `));
        add(`- **${DIARIO_ENERGIA}:** ☐ 1 ☐ 2 ☐ 3 ☐ 4 ☐ 5`, '');
      });
      add('#### Ao final do experimento', '');
      REFLEXAO.forEach((q) => add(`- ${q} ☐ Sim ☐ Não ☐ Talvez`));
      add('- **Anotações:** ', '');
    });
  }

  add('---', '', '_Mentoria de carreira [WoMakersCode](https://www.womakerscode.org) · Plano de carreira: da intenção à ação_', '');
  return out.join('\n');
}
