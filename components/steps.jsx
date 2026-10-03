'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  DIMENSOES, GAPS, FASES, CADEIA, NIVEIS, EXEMPLOS_MATRIZ, EXEMPLOS_EXPERIMENTO, REFLEXAO, PLANO_CAMPOS, PROXIMO,
} from '@/lib/data';
import { preencherVazios } from '@/lib/state';
import borboleta from '@/assets/img/borboleta.png';
import { Campo, Cabecalho, Dica, useApp } from './ui';
import { RadarChart, MatrizChart, ResumoQuadrantes } from './charts';

export const MAX_POR_FASE = 3;
const MAX_EXPERIMENTOS = 3;

function Inicio() {
  return (
    <>
      <div className="hero">
        <div>
          <span className="kicker mono">Mentoria de carreira · WoMakersCode</span>
          <h1 className="hero__title">Plano de carreira: <em>da intenção à ação</em></h1>
          <blockquote className="hero__quote">Você não precisa ter todas as respostas. Precisa saber qual é o próximo passo.</blockquote>
        </div>
        <Image className="hero__img" src={borboleta} alt="" width={160} height={142} priority />
      </div>
      <div className="card">
        <div className="grid grid--2">
          <Campo path="nome" label="Seu nome" placeholder="Como você quer aparecer no seu plano" />
          <Campo path="data" label="Data da mentoria" type="date" />
        </div>
      </div>
      <h2 className="h2">O caminho de hoje</h2>
      <ol className="roadmap">
        {[
          ['Radar de carreira', 'O que eu quero?'],
          ['Onde estou hoje', 'O que eu já tenho e o que falta?'],
          ['Career Gap', '5 vagas → requisitos → 3 prioridades'],
          ['30-60-90', 'Transforme o gap em ação'],
          ['Impacto × Esforço', 'Não tente fazer tudo'],
          ['Experimentos', 'Você não precisa decidir. Pode testar.'],
          ['Meu plano', 'Seu one-pager em PDF'],
        ].map(([t, s]) => <li key={t}><b>{t}</b><span>{s}</span></li>)}
      </ol>
      <Dica titulo="Como funciona">
        Responda com frases curtas e honestas — não é preciso ter tudo definido agora. Seu progresso é salvo
        automaticamente e, ao final, você poderá baixar um PDF com o plano completo.
      </Dica>
    </>
  );
}

function Radar() {
  const { state, set } = useApp();
  return (
    <>
      <Cabecalho num="01" kicker="Ferramenta · Radar de carreira" titulo="Onde quero chegar?">
        Reflita sobre cada dimensão e indique o quanto ela está <b>clara para você hoje</b> (1 = nada clara; 5 = muito clara).
      </Cabecalho>
      <div className="radar-layout">
        <div className="radar-fields">
          {DIMENSOES.map((d) => (
            <div key={d.id} className="dim card">
              <div className="dim__head"><strong>{d.nome}</strong><span className="muted">{d.pergunta}</span></div>
              <Campo path={`radar.${d.id}.texto`} rows={2} placeholder={d.placeholder} aria={d.pergunta} />
              <label className="range">
                <span className="mono">Clareza</span>
                <input type="range" min="1" max="5" step="1" value={state.radar[d.id].nota}
                  data-path={`radar.${d.id}.nota`} aria-label={`Clareza de ${d.nome}`}
                  onChange={(e) => set(`radar.${d.id}.nota`, Number(e.target.value))} />
                <output className="mono">{state.radar[d.id].nota}/5</output>
              </label>
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
      <Dica>
        Não escolha uma carreira considerando apenas o que você gosta. Busque a interseção entre{' '}
        <b>o que você gosta</b>, <b>o que você consegue desenvolver</b> e <b>onde existe uma oportunidade real</b>.
      </Dica>
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
      <Cabecalho num="02" kicker="Diagnóstico" titulo="Onde estou hoje?">
        Observe seu momento atual sem julgamentos: todas as suas experiências fazem parte dessa trajetória.
      </Cabecalho>
      <div className="card">
        <Campo path="hoje.situacao" label="Meu momento atual" placeholder="Ex.: analista administrativa há 4 anos, estudando programação" />
      </div>
      <div className="grid grid--2">
        <div className="card"><Campo path="hoje.tenho" label="O que eu já tenho?" rows={6} placeholder="Competências, experiências, formações, projetos, relações, conquistas…" /></div>
        <div className="card"><Campo path="hoje.falta" label="O que está faltando?" rows={6} placeholder="Conhecimentos, experiências, contatos, evidências…" /></div>
      </div>
      <Dica>
        Competências desenvolvidas em outras áreas podem ser transferíveis. Comunicação, organização, negociação e
        resolução de problemas, por exemplo, são relevantes em diferentes carreiras.
      </Dica>
    </>
  );
}

function Gap() {
  const { state } = useApp();
  return (
    <>
      <Cabecalho num="03" kicker="Ferramenta · Career Gap" titulo="Encontre seu Career Gap">
        Compare seu momento atual com o objetivo profissional e identifique o que precisa ser desenvolvido.
      </Cabecalho>
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
      <Dica titulo="Dica prática">
        Antes de incluir “fazer um curso” no plano, analise <b>5 vagas</b> relacionadas ao cargo desejado e identifique
        os requisitos mais recorrentes.
      </Dica>
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
      <Cabecalho num="04" kicker="Ferramenta · 30-60-90" titulo="Transforme o gap em ação">
        Um plano objetivo e viável gera mais resultados do que um PDI extenso e difícil de executar.
      </Cabecalho>
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
      <Dica>
        <b>Evite transformar seu plano de carreira em uma lista extensa de cursos.</b> Em uma transição, experiências
        práticas e evidências concretas também são fundamentais.
      </Dica>
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
      <Cabecalho num="05" kicker="Ferramenta · Matriz de prioridade" titulo="Não tente fazer tudo">
        Avalie quais ações podem gerar <b>maior impacto</b> na sua carreira com <b>menor esforço</b> inicial.
      </Cabecalho>
      <div className="matriz-layout">
        <div>
          <div className="mx-actions">
            <button type="button" className="btn btn--sm btn--outline" onClick={importar}>Importar do meu 30-60-90</button>
            <button type="button" className="btn btn--sm btn--outline" onClick={usarExemplos}>Usar exemplos da mentoria</button>
          </div>
          <div className="mx-list">
            {state.matriz.length ? state.matriz.map((m, i) => (
              // eslint-disable-next-line react/no-array-index-key
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
      <Dica titulo="Para quem está sobrecarregada">
        Na matriz clássica de prioridades: <b>importante + urgente</b> → faça agora; <b>importante + não urgente</b> →
        planeje; <b>pouco importante + urgente</b> → avalie a necessidade; <b>pouco importante + não urgente</b> →
        deixe para outro momento.
      </Dica>
    </>
  );
}

function Experimentos() {
  const { state, update, toast } = useApp();
  const exps = state.experimentos;
  const adicionar = () => update((s) => ({ ...s, experimentos: [...s.experimentos, { area: '', duracao: '', acao: '' }] }));
  const remover = (i) => update((s) => ({ ...s, experimentos: s.experimentos.filter((_, j) => j !== i) }));
  const usarExemplo = (ex) => {
    const vazio = exps.findIndex((e) => !e.area && !e.duracao && !e.acao);
    if (vazio < 0 && exps.length >= MAX_EXPERIMENTOS) {
      toast(`Você já tem ${MAX_EXPERIMENTOS} experimentos. Remova um para adicionar outro.`);
      return;
    }
    update((s) => {
      const lista = [...s.experimentos];
      if (vazio >= 0) lista[vazio] = { ...ex }; else lista.push({ ...ex });
      return { ...s, experimentos: lista };
    });
  };

  return (
    <>
      <Cabecalho num="06" kicker="Bônus · Experimentos de carreira" titulo="Você não precisa decidir. Você pode testar.">
        Um experimento é uma ação de curto prazo que ajuda a avaliar, na prática, se uma área combina com seus objetivos.
      </Cabecalho>
      <div className="exps">
        {exps.map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
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
              <Campo path={`experimentos.${i}.acao`} label="Vou" placeholder="Ex.: conversar com duas pessoas da área" className="field--wide" />
            </div>
          </div>
        ))}
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
      <div className="card card--dark">
        <span className="mono pink">Depois do experimento, pergunte-se</span>
        <ul className="checks">{REFLEXAO.map((q) => <li key={q}>{q}</li>)}</ul>
        <p className="small">Essas perguntas estarão no PDF para orientar sua reflexão ao final do experimento.</p>
      </div>
      <Dica>Experimentar possibilidades é mais realista do que tentar encontrar uma única “profissão certa”.</Dica>
    </>
  );
}

function Plano() {
  const { state, update, toast, baixar, gerandoPdf } = useApp();
  const preencher = () => {
    const { state: novo, n } = preencherVazios(state);
    update(() => novo);
    toast(n ? `${n} campo(s) preenchido(s) com suas respostas.` : 'Nenhum campo vazio para preencher.');
  };
  return (
    <>
      <Cabecalho num="07" kicker="One-pager" titulo="Meu plano de carreira">
        Revise as respostas reunidas nas etapas anteriores, faça os ajustes necessários e baixe o plano em PDF.
      </Cabecalho>
      <div className="plano-actions">
        <button type="button" className="btn btn--sm btn--outline" onClick={preencher}>↺ Preencher campos vazios com minhas respostas</button>
      </div>
      <div className="plano">
        {PLANO_CAMPOS.map((p, i) => (
          <div key={p.id} className="plano__item card">
            <span className="plano__n mono">{String(i + 1).padStart(2, '0')}</span>
            <Campo path={`plano.${p.id}`} label={<>{p.titulo}<span className="muted"> · {p.prompt}</span></>} rows={3} />
          </div>
        ))}
      </div>
      <div className="card card--dark proximo">
        <span className="mono pink">Meu próximo passo</span>
        {PROXIMO.map((p) => <Campo key={p.id} path={`proximo.${p.id}`} label={`${p.prompt}…`} rows={2} />)}
      </div>
      <div className="download">
        <div>
          <h2 className="h2">Pronto! 🎉</h2>
          <p>Seu plano de carreira está estruturado. Baixe o PDF com o resumo executivo e o detalhamento dos exercícios.</p>
        </div>
        <button type="button" className="btn btn--primary btn--lg" id="btn-pdf" onClick={baixar} disabled={gerandoPdf}>
          {gerandoPdf ? 'Gerando PDF…' : 'Baixar meu PDF'}
        </button>
      </div>
    </>
  );
}

export const PASSOS = [
  { id: 'inicio', label: 'Início', Componente: Inicio },
  { id: 'radar', label: 'Radar', Componente: Radar },
  { id: 'hoje', label: 'Onde estou', Componente: Hoje },
  { id: 'gap', label: 'Career Gap', Componente: Gap },
  { id: 'acao', label: '30-60-90', Componente: Acao },
  { id: 'matriz', label: 'Prioridades', Componente: Matriz },
  { id: 'experimento', label: 'Experimentos', Componente: Experimentos },
  { id: 'plano', label: 'Meu plano', Componente: Plano },
];
