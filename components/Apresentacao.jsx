'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  CADEIA, DIARIO, DIARIO_ENERGIA, DIMENSOES, EXEMPLOS_EXPERIMENTO, EXEMPLOS_MATRIZ, FASES, GAPS, PLANO_CAMPOS, PROXIMO,
  QUADRANTES, REFLEXAO, quadrante,
} from '@/lib/data';
import borboleta from '@/assets/img/borboleta.png';
import logo from '@/assets/img/logo-womakerscode.png';
import { CONTEUDO, FRASE, ROADMAP } from './conteudo';

function Titulo({ etapa }) {
  const c = CONTEUDO[etapa];
  return (
    <header className="slide__head">
      <span className="kicker mono">{c.num && <><b>{c.num}</b> · </>}{c.kicker}</span>
      <h1>{c.titulo}</h1>
      {c.lead && <p className="slide__lead">{c.lead}</p>}
    </header>
  );
}

function DicaSlide({ etapa }) {
  const { dica } = CONTEUDO[etapa];
  return (
    <aside className="slide__dica">
      <span className="mono">{dica.titulo}</span>
      <p>{dica.texto}</p>
    </aside>
  );
}

const SLIDES = [
  {
    etapa: 'inicio',
    render: () => (
      <div className="slide__capa">
        <div>
          <span className="kicker mono">{CONTEUDO.inicio.kicker}</span>
          <h1 className="slide__capa-titulo">Plano de carreira: <em>da intenção à ação</em></h1>
          <blockquote className="slide__frase">{FRASE}</blockquote>
        </div>
        <Image src={borboleta} alt="" width={220} height={195} priority />
      </div>
    ),
  },
  {
    etapa: 'inicio',
    render: () => (
      <>
        <header className="slide__head"><span className="kicker mono">Roteiro</span><h1>O caminho de hoje</h1></header>
        <ol className="slide__roadmap">
          {ROADMAP.map(([t, s]) => <li key={t}><b>{t}</b><span>{s}</span></li>)}
        </ol>
      </>
    ),
  },
  {
    etapa: 'radar',
    render: () => (
      <>
        <Titulo etapa="radar" />
        <div className="slide__grid slide__grid--5">
          {DIMENSOES.map((d) => <div key={d.id} className="slide__card"><b>{d.nome}</b><span>{d.pergunta}</span></div>)}
        </div>
        <DicaSlide etapa="radar" />
      </>
    ),
  },
  {
    etapa: 'hoje',
    render: () => (
      <>
        <Titulo etapa="hoje" />
        <div className="slide__grid slide__grid--2">
          <div className="slide__card slide__card--grande"><b>O que eu já tenho?</b><span>Competências, experiências, formações, projetos, relações, conquistas…</span></div>
          <div className="slide__card slide__card--grande"><b>O que está faltando?</b><span>Conhecimentos, experiências, contatos, evidências…</span></div>
        </div>
        <DicaSlide etapa="hoje" />
      </>
    ),
  },
  {
    etapa: 'gap',
    render: () => (
      <>
        <Titulo etapa="gap" />
        <div className="slide__pipeline mono">
          <span>5 vagas</span>→<span>requisitos recorrentes</span>→<span>3 competências prioritárias</span>→<span>plano de desenvolvimento</span>
        </div>
        <div className="slide__grid slide__grid--4">
          {GAPS.map((g) => <div key={g.id} className="slide__card"><b>{g.nome}</b><span>{g.pergunta}</span></div>)}
        </div>
        <DicaSlide etapa="gap" />
      </>
    ),
  },
  {
    etapa: 'acao',
    render: () => (
      <>
        <Titulo etapa="acao" />
        <div className="slide__cadeia">
          {CADEIA.map((c, i) => (
            <div key={c.id} className={`slide__card${i === 2 ? ' slide__card--escuro' : ''}`}>
              <b>{c.nome}</b><span>{c.placeholder.replace(/^Ex\.: /, '')}</span>
            </div>
          ))}
        </div>
        <div className="slide__grid slide__grid--3">
          {FASES.map((f) => (
            <div key={f.id} className="slide__card slide__fase">
              <span className="mono">{f.titulo}</span><b>{f.foco}</b>
              <span>{f.exemplos.slice(0, 3).join(' · ')}</span>
            </div>
          ))}
        </div>
        <DicaSlide etapa="acao" />
      </>
    ),
  },
  {
    etapa: 'matriz',
    render: () => (
      <>
        <Titulo etapa="matriz" />
        <div className="slide__matriz">
          <span className="slide__eixo slide__eixo--y mono">Impacto →</span>
          {['agora', 'planeje', 'avalie', 'depois'].map((k) => (
            <div key={k} className={`slide__q slide__q--${k}`}>
              <b>{QUADRANTES[k].titulo}</b>
              <span className="mono">{QUADRANTES[k].desc}</span>
              <ul>{EXEMPLOS_MATRIZ.filter((m) => quadrante(m) === k).map((m) => <li key={m.acao}>{m.acao}</li>)}</ul>
            </div>
          ))}
          <span className="slide__eixo slide__eixo--x mono">Esforço →</span>
        </div>
      </>
    ),
  },
  {
    etapa: 'experimento',
    render: () => (
      <>
        <Titulo etapa="experimento" />
        <p className="slide__formula">“Quero explorar <u>área</u>. Durante <u>tempo</u>, vou <u>ação</u>.”</p>
        <ul className="slide__exemplos">
          {EXEMPLOS_EXPERIMENTO.map((e) => <li key={e.area}>Durante {e.duracao}, vou {e.acao}.</li>)}
        </ul>
        <div className="slide__grid slide__grid--2">
          <div className="slide__card slide__card--escuro">
            <span className="mono">Toda semana</span>
            <ul>{DIARIO.map((d) => <li key={d.id}>{d.pergunta}</li>)}<li>{DIARIO_ENERGIA}</li></ul>
          </div>
          <div className="slide__card slide__card--escuro">
            <span className="mono">Ao final</span>
            <ul>{REFLEXAO.map((q) => <li key={q}>{q}</li>)}</ul>
          </div>
        </div>
      </>
    ),
  },
  {
    etapa: 'plano',
    render: () => (
      <>
        <Titulo etapa="plano" />
        <div className="slide__grid slide__grid--3 slide__grid--compacto">
          {PLANO_CAMPOS.map((p, i) => (
            <div key={p.id} className="slide__card">
              <span className="mono">{String(i + 1).padStart(2, '0')}</span><b>{p.titulo}</b><span>{p.prompt}</span>
            </div>
          ))}
        </div>
        <div className="slide__proximo">
          <span className="mono">Meu próximo passo</span>
          <p>{PROXIMO.map((p) => `${p.prompt}…`).join(' ')}</p>
        </div>
      </>
    ),
  },
  {
    etapa: 'plano',
    render: () => (
      <div className="slide__capa slide__capa--fim">
        <Image src={borboleta} alt="" width={160} height={142} />
        <blockquote className="slide__frase">{FRASE}</blockquote>
        <p className="slide__lead">Baixe seu plano em PDF ou Markdown e combine seu primeiro passo para os próximos 30 dias.</p>
      </div>
    ),
  },
];

export default function Apresentacao({ etapaInicial, onSair }) {
  const [i, setI] = useState(() => Math.max(0, SLIDES.findIndex((s) => s.etapa === etapaInicial)));
  const raiz = useRef(null);
  const ir = useCallback((n) => setI(Math.max(0, Math.min(SLIDES.length - 1, n))), []);

  useEffect(() => { raiz.current?.focus(); }, []);

  useEffect(() => {
    const tecla = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      // Enter/Espaço num botão devem acionar o botão, não avançar o slide.
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest?.('button')) return;
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); setI((n) => Math.min(SLIDES.length - 1, n + 1)); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); setI((n) => Math.max(0, n - 1)); }
      else if (e.key === 'Home') ir(0);
      else if (e.key === 'End') ir(SLIDES.length - 1);
      else if (e.key === 'Escape') onSair();
      else if (e.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
        else document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [ir, onSair]);

  const slide = SLIDES[i];
  return (
    <div className="apresentacao" ref={raiz} tabIndex={-1} role="region" aria-roledescription="apresentação"
      aria-label="Modo apresentação">
      <div className="apresentacao__topo">
        <Image src={logo} alt="WoMakersCode" className="apresentacao__logo" />
        <span className="mono">Mentoria de carreira</span>
      </div>
      <div className="stripe" aria-hidden="true" />
      <section className="slide" key={i} aria-roledescription="slide" aria-label={`${i + 1} de ${SLIDES.length}`}>
        {slide.render()}
      </section>
      <nav className="apresentacao__nav" aria-label="Controles da apresentação">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => ir(i - 1)} disabled={i === 0}>← Anterior</button>
        <span className="mono" aria-live="polite">{i + 1} / {SLIDES.length}</span>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => ir(i + 1)} disabled={i === SLIDES.length - 1}>Próximo →</button>
        <button type="button" className="btn btn--ghost btn--sm apresentacao__sair" onClick={onSair}>Sair (Esc)</button>
      </nav>
      <div className="apresentacao__progresso" aria-hidden="true"><div style={{ width: `${((i + 1) / SLIDES.length) * 100}%` }} /></div>
    </div>
  );
}
