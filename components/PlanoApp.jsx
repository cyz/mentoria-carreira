'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { estadoInicial } from '@/lib/data';
import { carregarEstado, limparEstado, preencherVazios, salvarEstado, setPath } from '@/lib/state';
import logo from '@/assets/img/logo-womakerscode.png';
import borboleta from '@/assets/img/borboleta.png';
import { AppContext } from './ui';
import { PASSOS } from './steps';

const idxPlano = PASSOS.findIndex((p) => p.id === 'plano');

/* Ao chegar no one-pager pela primeira vez, traz as respostas das etapas anteriores. */
function aoEntrar(state, passo) {
  if (passo !== idxPlano || state.ui.preenchido) return state;
  const { state: novo } = preencherVazios(state);
  return { ...novo, ui: { ...novo.ui, preenchido: true } };
}

export default function PlanoApp() {
  const [state, setState] = useState(null);
  const [salvo, setSalvo] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const stepRef = useRef(null);
  const stepperRef = useRef(null);
  const timers = useRef({});

  // localStorage só existe no navegador: carrega após a montagem.
  useEffect(() => {
    const inicial = carregarEstado();
    const doHash = PASSOS.findIndex((p) => p.id === window.location.hash.slice(1));
    let passo = doHash >= 0 ? doHash : inicial.ui.passo;
    if (!(passo >= 0 && passo < PASSOS.length)) passo = 0;
    setState(aoEntrar({ ...inicial, ui: { ...inicial.ui, passo } }, passo));
  }, []);

  useEffect(() => {
    if (!state) return;
    if (salvarEstado(state)) {
      setSalvo(true);
      clearTimeout(timers.current.salvo);
      timers.current.salvo = setTimeout(() => setSalvo(false), 1400);
    }
    const id = PASSOS[state.ui.passo].id;
    if (window.location.hash.slice(1) !== id) window.history.replaceState(null, '', `#${id}`);
  }, [state]);

  const passo = state ? state.ui.passo : 0;

  useEffect(() => {
    const atual = stepperRef.current?.querySelector('.is-current');
    atual?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }, [passo]);

  const toast = useCallback((msg) => {
    setMensagem(msg);
    clearTimeout(timers.current.toast);
    timers.current.toast = setTimeout(() => setMensagem(''), 2600);
  }, []);

  const irPara = useCallback((i) => {
    const n = Math.max(0, Math.min(PASSOS.length - 1, i));
    setState((s) => aoEntrar({ ...s, ui: { ...s.ui, passo: n } }, n));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    stepRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onHash = () => {
      const i = PASSOS.findIndex((p) => p.id === window.location.hash.slice(1));
      if (i >= 0) irPara(i);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [irPara]);

  const set = useCallback((path, value) => setState((s) => setPath(s, path, value)), []);
  const update = useCallback((fn) => setState((s) => fn(s)), []);

  const baixar = useCallback(async () => {
    setGerandoPdf(true);
    try {
      const { baixarPdf } = await import('@/lib/pdf');
      await baixarPdf(state);
      toast('PDF baixado com sucesso! 💗');
    } catch (err) {
      console.error(err);
      toast('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerandoPdf(false);
    }
  }, [state, toast]);

  const recomecar = () => {
    if (!window.confirm('Apagar todas as suas respostas deste navegador e recomeçar?')) return;
    limparEstado();
    setState(estadoInicial());
    window.scrollTo({ top: 0 });
    toast('Respostas apagadas. Você já pode recomeçar!');
  };

  const ctx = useMemo(
    () => ({ state, set, update, toast, irPara, baixar, gerandoPdf }),
    [state, set, update, toast, irPara, baixar, gerandoPdf],
  );

  const Passo = PASSOS[passo].Componente;

  return (
    <AppContext.Provider value={ctx}>
      <header className="topbar">
        <div className="container topbar__inner">
          <a className="brand" href="https://www.womakerscode.org" target="_blank" rel="noopener noreferrer" title="WoMakersCode">
            <Image src={logo} alt="WoMakersCode" priority />
          </a>
          <div className="topbar__title">
            <span className="mono">Mentoria de carreira</span>
            <strong>Plano de carreira: da intenção à ação</strong>
          </div>
          <button className="btn btn--ghost btn--sm" type="button" onClick={recomecar} disabled={!state}
            title="Apagar todas as respostas deste navegador">
            Recomeçar
          </button>
        </div>
        <div className="stripe" aria-hidden="true" />
      </header>

      <nav className="stepper" aria-label="Etapas">
        <div className="container">
          <ol className="stepper__list" ref={stepperRef}>
            {PASSOS.map((p, i) => (
              <li key={p.id} className={`${i === passo ? 'is-current' : ''} ${i < passo ? 'is-done' : ''}`}>
                <button type="button" onClick={() => irPara(i)} aria-current={i === passo ? 'step' : undefined} disabled={!state}>
                  <span className="stepper__n mono">{i === 0 ? '★' : i}</span>
                  <span className="stepper__l">{p.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <main className="container main">
        <div className="progress" aria-hidden="true">
          <div className="progress__bar" style={{ width: `${(passo / (PASSOS.length - 1)) * 100}%` }} />
        </div>
        <section className="step" key={passo} ref={stepRef} tabIndex={-1} aria-live="polite">
          {state ? <Passo /> : <p className="muted loading">Carregando suas respostas…</p>}
        </section>
        {state && (
          <div className="nav-buttons">
            <button className="btn btn--outline" type="button" id="btn-prev" onClick={() => irPara(passo - 1)}
              style={{ visibility: passo === 0 ? 'hidden' : 'visible' }}>
              ← Voltar
            </button>
            <span className={`save-status mono${salvo ? ' is-saved' : ''}`}>
              {salvo ? 'Alterações salvas ✓' : 'Salvamento automático'}
            </span>
            <button className="btn btn--primary" type="button" id="btn-next" onClick={() => irPara(passo + 1)}
              style={{ visibility: passo === PASSOS.length - 1 ? 'hidden' : 'visible' }}>
              {passo === 0 ? 'Começar →' : 'Avançar →'}
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <Image src={borboleta} alt="" width={28} height={25} />
          <p>O processamento é privado no seu navegador. Nada é compartilhado externamente.</p>
          <a className="mono" href="https://www.womakerscode.org" target="_blank" rel="noopener noreferrer">womakerscode.org</a>
        </div>
      </footer>

      <div className={`toast${mensagem ? ' is-visible' : ''}`} role="status" aria-live="polite">{mensagem}</div>
    </AppContext.Provider>
  );
}
