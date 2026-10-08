'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  DIMENSOES, GAPS, FASES, CADEIA, NIVEIS, EXEMPLOS_MATRIZ, EXEMPLOS_EXPERIMENTO, REFLEXAO, PLANO_CAMPOS, PROXIMO,
  DIARIO, DIARIO_ENERGIA, novoExperimento, notaTexto, tituloDoPlano,
} from '@/lib/data';
import { duracaoReconhecida, formatarCurta, semanasDiario } from '@/lib/datas';
import {
  MAX_EXPERIMENTOS, camposDesatualizados, preencherVazios, resolverDesatualizados,
} from '@/lib/state';
import borboleta from '@/assets/img/borboleta.png';
import { Campo, CabecalhoEtapa, Dica, DicaEtapa, useApp } from './ui';
import { RadarChart, MatrizChart, ResumoQuadrantes } from './charts';
import { CONTEUDO, FRASE, ROADMAP } from './conteudo';

export const MAX_POR_FASE = 3;

function Inicio() {
  const { state, abrirPlanos } = useApp();
  return (
    <>
      <div className="hero">
        <div>
          <span className="kicker mono">{CONTEUDO.inicio.kicker}</span>
          <h1 className="hero__title">Plano de carreira: <em>da intenção à ação</em></h1>
          <blockquote className="hero__quote">{FRASE}</blockquote>
        </div>
        <Image className="hero__img" src={borboleta} alt="" width={160} height={142} priority />
      </div>
      <div className="card">
        <div className="plano-atual">
          <span className="muted">Você está preenchendo o plano <b>“{tituloDoPlano(state)}”</b>.</span>
          <button type="button" className="btn btn--sm btn--outline" onClick={abrirPlanos}>Meus planos</button>
        </div>
        <div className="grid grid--2">
          <Campo path="nome" label="Seu nome" placeholder="Como você quer aparecer no seu plano" />
          <Campo path="data" label="Data da mentoria" type="date" />
        </div>
      </div>
      <h2 className="h2">O caminho de hoje</h2>
      <ol className="roadmap">
        {ROADMAP.map(([t, sub]) => <li key={t}><b>{t}</b><span>{sub}</span></li>)}
      </ol>
      <DicaEtapa etapa="inicio" />
    </>
  );
}

function Radar() {
  const { state, set } = useApp();
  return (
    <>
      <CabecalhoEtapa etapa="radar" />
      <div className="radar-layout">
        <div className="radar-fields">
          {DIMENSOES.map((d) => (
            <div key={d.id} className="dim card">
              <div className="dim__head"><strong>{d.nome}</strong><span className="muted">{d.pergunta}</span></div>
              <Campo path={`radar.${d.id}.texto`} rows={2} placeholder={d.placeholder} aria={d.pergunta} />
              <fieldset className="seg seg--nota" data-path={`radar.${d.id}.nota`}>
                <legend className="mono">Clareza</legend>
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n}>
                    <input type="radio" name={`nota-${d.id}`} value={n} checked={state.radar[d.id].nota === n}
                      aria-label={`Clareza de ${d.nome}: ${n} de 5`}
                      onChange={() => set(`radar.${d.id}.nota`, n)} />
                    <span>{n}</span>
                  </label>
                ))}
                <output className="mono muted">{state.radar[d.id].nota ? notaTexto(state.radar[d.id].nota) : 'Não avaliada'}</output>
              </fieldset>
            </div>
          ))}
        </div>
        <div className="radar-side">
          <div className="card card--sticky">
            <RadarChart />
            <p className="muted small">As dimensões com menor pontuação podem orientar suas conversas e seus experimentos.</p>
          </div>
        </div>
      </div>
      <DicaEtapa etapa="radar" />
      <div className="card card--accent">
        <Campo path="direcao" label="Minha direção" rows={2}
          placeholder="Quero me aproximar de… (ex.: análise de dados em empresas de saúde)"
          hint="A interseção entre interesse, competência e mercado." />
      </div>
    </>
  );
}

function Hoje() {
  return (
    <>
      <CabecalhoEtapa etapa="hoje" />
      <div className="card">
        <Campo path="hoje.situacao" label="Meu momento atual" placeholder="Ex.: analista administrativa há 4 anos, estudando programação" />
      </div>
      <div className="grid grid--2">
        <div className="card"><Campo path="hoje.tenho" label="O que eu já tenho?" rows={6} placeholder="Competências, experiências, formações, projetos, relações, conquistas…" /></div>
        <div className="card"><Campo path="hoje.falta" label="O que está faltando?" rows={6} placeholder="Conhecimentos, experiências, contatos, evidências…" /></div>
      </div>
      <DicaEtapa etapa="hoje" />
    </>
  );
}

function Gap() {
  const { state } = useApp();
  return (
    <>
      <CabecalhoEtapa etapa="gap" />
      <div className="flow">
        <div className="flow__item">
          <span className="mono">Onde estou</span>
          <p>{state.hoje.situacao || <span className="muted">Preencha na etapa anterior</span>}</p>
        </div>
        <div className="flow__arrow" aria-hidden="true">→</div>
        <div className="flow__item flow__item--input">
          <Campo path="cargoAlvo" label={<span className="mono">Onde quero chegar</span>} placeholder="Cargo ou papel desejado" />
        </div>
        <div className="flow__arrow" aria-hidden="true">→</div>
        <div className="flow__item flow__item--accent"><span className="mono">O que falta?</span><p>Investigue as demandas do mercado ↓</p></div>
      </div>
      <DicaEtapa etapa="gap" />
      <div className="pipeline mono" aria-hidden="true">
        <span>5 vagas</span>→<span>requisitos recorrentes</span>→<span>3 competências prioritárias</span>→<span>plano de desenvolvimento</span>
      </div>
      <h2 className="h2">1. Analise 5 vagas</h2>
      <div className="vagas">
        {state.vagas.map((_, i) => (
          <div key={i} className="vaga card">
            <span className="vaga__n mono">Vaga {i + 1}</span>
            <Campo path={`vagas.${i}.titulo`} placeholder="Cargo · empresa" aria={`Vaga ${i + 1}: cargo e empresa`} />
            <Campo path={`vagas.${i}.requisitos`} rows={3} placeholder="Principais requisitos" aria={`Vaga ${i + 1}: requisitos`} />
          </div>
        ))}
      </div>
      <div className="grid grid--2">
        <div className="card"><Campo path="recorrentes" label="2. O que aparece repetidamente?" rows={5} placeholder="Requisitos que aparecem em 3 ou mais vagas" /></div>
        <div className="card card--accent">
          <span className="field__label">3. Minhas 3 competências prioritárias</span>
          {state.prioridades.map((_, i) => (
            <Campo key={i} path={`prioridades.${i}`} placeholder={`Prioridade ${i + 1}`} aria={`Competência prioritária ${i + 1}`} />
          ))}
        </div>
      </div>
      <h2 className="h2">4. Separe o seu gap</h2>
      <div className="grid grid--2">
        {GAPS.map((g) => (
          <div key={g.id} className="card">
            <Campo path={`gap.${g.id}`} label={<>{g.nome} <span className="muted">· {g.pergunta}</span></>} rows={3} placeholder={g.placeholder} />
          </div>
        ))}
      </div>
    </>
  );
}

function Fase({ fase }) {
  const { state, update, toast } = useApp();
  const [novo, setNovo] = useState('');
  const itens = state.fases[fase.id];

  const adicionar = (valor) => {
    const v = String(valor || '').trim();
    if (!v) return false;
    if (itens.some((t) => t.toLowerCase() === v.toLowerCase())) { toast('Essa ação já está na lista.'); return false; }
    update((s) => ({ ...s, fases: { ...s.fases, [fase.id]: [...s.fases[fase.id], v] } }));
    return true;
  };
  const remover = (i) => update((s) => ({ ...s, fases: { ...s.fases, [fase.id]: s.fases[fase.id].filter((_, j) => j !== i) } }));

  return (
    <div className="fase card">
      <div className="fase__head"><span className="mono">{fase.titulo}</span><strong>{fase.foco}</strong></div>
      <ul className="lista">
        {itens.length ? itens.map((t, i) => (
          <li key={t}>
            <span>{t}</span>
            <button type="button" className="icon-btn" onClick={() => remover(i)} aria-label={`Remover ${t}`}>×</button>
          </li>
        )) : <li className="lista__vazia muted">Nenhuma ação ainda</li>}
      </ul>
      {itens.length > MAX_POR_FASE && <p className="warn small">Menos é mais: tente manter até {MAX_POR_FASE} ações.</p>}
      <form className="add" onSubmit={(e) => { e.preventDefault(); if (adicionar(novo)) setNovo(''); }}>
        <input type="text" value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="Nova ação…"
          aria-label={`Nova ação para ${fase.titulo}`} data-add={fase.id} />
        <button className="btn btn--sm btn--dark" type="submit" aria-label="Adicionar">+</button>
      </form>
      <div className="chips">
        {fase.exemplos.map((e) => (
          <button key={e} type="button" className="chip" data-fase={fase.id} onClick={() => adicionar(e)}>+ {e}</button>
        ))}
      </div>
    </div>
  );
}

function Acao() {
  const { state } = useApp();
  const cursos = FASES.flatMap((f) => state.fases[f.id])
    .filter((t) => /curso|certifica|aula|forma[cç][aã]o|bootcamp|workshop|treinamento/i.test(t)).length;
  return (
    <>
      <CabecalhoEtapa etapa="acao" />
      <h2 className="h2">Objetivo → Gap → Ação → Evidência → Prazo</h2>
      <div className="chain">
        {CADEIA.map((c, i) => (
          <div key={c.id} style={{ display: 'contents' }}>
            {i > 0 && <span className="chain__arrow" aria-hidden="true">→</span>}
            <div className="chain__item"><Campo path={`cadeia.${c.id}`} label={c.nome} rows={3} placeholder={c.placeholder} /></div>
          </div>
        ))}
      </div>
      <h2 className="h2">Meu 30-60-90</h2>
      <p className="muted">Até {MAX_POR_FASE} ações por fase. Clique nos exemplos para adicionar ou escreva as suas.</p>
      <div className="fases">{FASES.map((f) => <Fase key={f.id} fase={f} />)}</div>
      {cursos >= 3 && (
        <Dica titulo="Atenção">Você incluiu {cursos} ações relacionadas a cursos. Considere substituir alguma delas por prática ou produção de evidências.</Dica>
      )}
      <DicaEtapa etapa="acao" />
    </>
  );
}

function Matriz() {
  const { state, set, update, toast } = useApp();
  const existentes = () => new Set(state.matriz.map((m) => m.acao.trim().toLowerCase()));

  const usarExemplos = () => {
    const ex = existentes();
    const novos = EXEMPLOS_MATRIZ.filter((m) => !ex.has(m.acao.toLowerCase()));
    update((s) => ({ ...s, matriz: [...s.matriz, ...novos.map((m) => ({ ...m }))] }));
    toast(novos.length ? `${novos.length} exemplos adicionados — ajuste para a sua realidade.` : 'Os exemplos já estão na lista.');
  };
  const importar = () => {
    const ex = existentes();
    const novos = [...new Set(FASES.flatMap((f) => state.fases[f.id]))].filter((t) => !ex.has(t.toLowerCase()));
    update((s) => ({ ...s, matriz: [...s.matriz, ...novos.map((acao) => ({ acao, impacto: 3, esforco: 2 }))] }));
    toast(novos.length ? `${novos.length} ações importadas. Agora classifique cada uma.` : 'Nenhuma ação nova no seu 30-60-90.');
  };
  const adicionar = () => update((s) => ({ ...s, matriz: [...s.matriz, { acao: '', impacto: 3, esforco: 2 }] }));
  const remover = (i) => update((s) => ({ ...s, matriz: s.matriz.filter((_, j) => j !== i) }));

  return (
    <>
      <CabecalhoEtapa etapa="matriz" />
      <div className="matriz-layout">
        <div>
          <div className="mx-actions">
            <button type="button" className="btn btn--sm btn--outline" onClick={importar}>Importar do meu 30-60-90</button>
            <button type="button" className="btn btn--sm btn--outline" onClick={usarExemplos}>Usar exemplos da mentoria</button>
          </div>
          <div className="mx-list">
            {state.matriz.length ? state.matriz.map((m, i) => (
              <div key={i} className="mx-row card">
                <div className="mx-row__top">
                  <span className="mx-row__n">{i + 1}</span>
                  <Campo path={`matriz.${i}.acao`} placeholder="Ação" aria={`Ação ${i + 1}`} className="field--grow" />
                  <button type="button" className="icon-btn" onClick={() => remover(i)} aria-label={`Remover ação ${i + 1}`}>×</button>
                </div>
                {['impacto', 'esforco'].map((eixo) => (
                  <fieldset key={eixo} className="seg">
                    <legend className="mono">{eixo === 'impacto' ? 'Impacto' : 'Esforço'}</legend>
                    {NIVEIS.map((n, v) => (
                      <label key={n}>
                        <input type="radio" name={`mx-${eixo}-${i}`} value={v + 1} checked={Number(m[eixo]) === v + 1}
                          onChange={() => set(`matriz.${i}.${eixo}`, v + 1)} />
                        <span>{n}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
            )) : <p className="muted">Adicione ações para classificá-las.</p>}
          </div>
          <button type="button" className="btn btn--dark" onClick={adicionar}>+ Adicionar ação</button>
        </div>
        <div className="card card--sticky"><MatrizChart /></div>
      </div>
      <ResumoQuadrantes />
      <DicaEtapa etapa="matriz" />
    </>
  );
}

function Experimentos() {
  const { state, update, toast } = useApp();
  const exps = state.experimentos;
  const adicionar = () => update((s) => ({ ...s, experimentos: [...s.experimentos, novoExperimento()] }));
  const remover = (i) => update((s) => ({ ...s, experimentos: s.experimentos.filter((_, j) => j !== i) }));
  const usarExemplo = (ex) => {
    const vazio = exps.findIndex((e) => !e.area && !e.duracao && !e.acao);
    if (vazio < 0 && exps.length >= MAX_EXPERIMENTOS) {
      toast(`Você já tem ${MAX_EXPERIMENTOS} experimentos. Remova um para adicionar outro.`);
      return;
    }
    update((s) => {
      const lista = [...s.experimentos];
      if (vazio >= 0) lista[vazio] = { ...lista[vazio], ...ex }; else lista.push({ ...novoExperimento(), ...ex });
      return { ...s, experimentos: lista };
    });
  };

  return (
    <>
      <CabecalhoEtapa etapa="experimento" />
      <div className="exps">
        {exps.map((e, i) => {
          const semanas = semanasDiario(e, state.data);
          const ultima = semanas[semanas.length - 1];
          return (
            <div key={i} className="exp card">
              <div className="exp__head">
                <span className="mono">Experimento {i + 1}</span>
                {exps.length > 1 && (
                  <button type="button" className="icon-btn" onClick={() => remover(i)} aria-label={`Remover experimento ${i + 1}`}>×</button>
                )}
              </div>
              <div className="exp__sentence">
                <Campo path={`experimentos.${i}.area`} label="Quero explorar" placeholder="Área ou tema" />
                <Campo path={`experimentos.${i}.duracao`} label="Durante" placeholder="Ex.: 2 semanas" />
                <Campo path={`experimentos.${i}.inicio`} label={<>A partir de <span className="muted">(opcional)</span></>} type="date" />
                <Campo path={`experimentos.${i}.acao`} label="Vou" placeholder="Ex.: conversar com duas pessoas da área" className="field--wide" />
              </div>
              {(e.area || e.acao || e.duracao) && (
                <p className="exp__diario small">
                  <span className="mono">Diário</span>
                  {semanas.length} {semanas.length > 1 ? 'semanas' : 'semana'} de registro, de {formatarCurta(semanas[0].inicio)} a {formatarCurta(ultima.fim)}
                  {!e.inicio && ', contando a partir da data da mentoria'}
                  {!duracaoReconhecida(e.duracao) && ' (escreva a duração como “3 semanas” ou “1 mês” para ajustar)'}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {exps.length < MAX_EXPERIMENTOS && (
        <button type="button" className="btn btn--dark" onClick={adicionar}>+ Adicionar experimento</button>
      )}
      <div className="chips chips--block">
        <span className="mono muted">Inspirações:</span>
        {EXEMPLOS_EXPERIMENTO.map((e, i) => (
          <button key={e.area} type="button" className="chip" data-exemplo={i} onClick={() => usarExemplo(e)}>
            “Durante {e.duracao}, vou {e.acao}”
          </button>
        ))}
      </div>
      <div className="grid grid--2 diario-grid">
        <div className="card card--dark">
          <span className="mono pink">Toda semana, durante o experimento</span>
          <ul className="diario-perguntas">
            {DIARIO.map((d) => <li key={d.id}>{d.pergunta}</li>)}
            <li>{DIARIO_ENERGIA}</li>
          </ul>
        </div>
        <div className="card card--dark">
          <span className="mono pink">Ao final, pergunte-se</span>
          <ul className="checks">{REFLEXAO.map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
      </div>
      <p className="muted small">
        O diário semanal, com as datas de cada semana, e as perguntas finais estarão no seu PDF e no Markdown.
      </p>
      <DicaEtapa etapa="experimento" />
    </>
  );
}

function AvisoDesatualizado({ campo }) {
  const { update } = useApp();
  if (!campo) return null;
  const resolver = (aplicar) => update((s) => resolverDesatualizados(s, [campo.path], aplicar));
  return (
    <div className="aviso" role="note">
      <span>Sua resposta de origem mudou para: <i>“{campo.nova}”</i></span>
      <span className="aviso__acoes">
        <button type="button" className="link-btn" onClick={() => resolver(true)}>Atualizar</button>
        <button type="button" className="link-btn" onClick={() => resolver(false)}>Manter</button>
      </span>
    </div>
  );
}

function Plano() {
  const { state, update, toast, baixar, gerandoPdf, baixarMarkdown, copiarMarkdown } = useApp();
  const desatualizados = camposDesatualizados(state);
  const porPath = Object.fromEntries(desatualizados.map((c) => [c.path, c]));
  const preencher = () => {
    const { state: novo, n } = preencherVazios(state);
    update(() => novo);
    toast(n ? `${n} campo(s) preenchido(s) com suas respostas.` : 'Nenhum campo vazio para preencher.');
  };
  const resolverTodos = (aplicar) => {
    update((s) => resolverDesatualizados(s, desatualizados.map((c) => c.path), aplicar));
    toast(aplicar ? 'Campos atualizados com suas respostas mais recentes.' : 'Seu texto foi mantido.');
  };
  return (
    <>
      <CabecalhoEtapa etapa="plano" />
      <div className="plano-actions">
        <button type="button" className="btn btn--sm btn--outline" onClick={preencher}>↺ Preencher campos vazios com minhas respostas</button>
      </div>
      {desatualizados.length > 0 && (
        <div className="aviso aviso--geral" role="status">
          <span>
            <b>{desatualizados.length} {desatualizados.length > 1 ? 'campos usam respostas' : 'campo usa uma resposta'}</b>{' '}
            que você mudou nas etapas anteriores.
          </span>
          <span className="aviso__acoes">
            <button type="button" className="btn btn--sm btn--dark" onClick={() => resolverTodos(true)}>Atualizar todos</button>
            <button type="button" className="btn btn--sm btn--outline" onClick={() => resolverTodos(false)}>Manter como está</button>
          </span>
        </div>
      )}
      <div className="plano">
        {PLANO_CAMPOS.map((p, i) => (
          <div key={p.id} className={`plano__item card${porPath[`plano.${p.id}`] ? ' is-stale' : ''}`}>
            <span className="plano__n mono">{String(i + 1).padStart(2, '0')}</span>
            <Campo path={`plano.${p.id}`} label={<>{p.titulo}<span className="muted"> · {p.prompt}</span></>} rows={3} />
            <AvisoDesatualizado campo={porPath[`plano.${p.id}`]} />
          </div>
        ))}
      </div>
      <div className="card card--dark proximo">
        <span className="mono pink">Meu próximo passo</span>
        {PROXIMO.map((p) => (
          <div key={p.id}>
            <Campo path={`proximo.${p.id}`} label={`${p.prompt}…`} rows={2} />
            <AvisoDesatualizado campo={porPath[`proximo.${p.id}`]} />
          </div>
        ))}
      </div>
      <div className="download">
        <div>
          <h2 className="h2">Pronto! 🎉</h2>
          <p>
            Baixe o PDF com o resumo executivo, o detalhamento dos exercícios e o diário semanal dos experimentos.
            Prefere editar no Notion ou no GitHub? Use o Markdown.
          </p>
        </div>
        <div className="download__acoes">
          <button type="button" className="btn btn--primary btn--lg" id="btn-pdf" onClick={baixar} disabled={gerandoPdf}>
            {gerandoPdf ? 'Gerando PDF…' : 'Baixar meu PDF'}
          </button>
          <div className="download__md">
            <button type="button" className="btn btn--sm btn--outline" onClick={baixarMarkdown}>Baixar Markdown (.md)</button>
            <button type="button" className="btn btn--sm btn--outline" onClick={copiarMarkdown}>Copiar Markdown</button>
          </div>
        </div>
      </div>
    </>
  );
}

export const PASSOS = [
  { id: 'inicio', Componente: Inicio },
  { id: 'radar', Componente: Radar },
  { id: 'hoje', Componente: Hoje },
  { id: 'gap', Componente: Gap },
  { id: 'acao', Componente: Acao },
  { id: 'matriz', Componente: Matriz },
  { id: 'experimento', Componente: Experimentos },
  { id: 'plano', Componente: Plano },
].map((p) => ({ ...p, label: CONTEUDO[p.id].label }));
