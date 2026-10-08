'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { estadoInicial, nomeArquivo, tituloDoPlano } from '@/lib/data';
import { hojeLocal } from '@/lib/datas';
import { preencherVazios, setPath } from '@/lib/state';
import { progressoEtapa, progressoGeral, statusEtapa } from '@/lib/progresso';
import {
  carregarPlano, chavePlano, criarPlano, definirAtivo, duplicarPlano, excluirPlano, gerarBackup, importarBackup,
  inicializar, lerIndice, listarPlanos, podeCriarPlano, restaurarPlano, salvarPlano,
} from '@/lib/armazenamento';
import { MAX_BACKUP_BYTES, baixarArquivo } from '@/lib/arquivo';
import { gerarMarkdown } from '@/lib/markdown';
import logo from '@/assets/img/logo-womakerscode.png';
import borboleta from '@/assets/img/borboleta.png';
import { AppContext } from './ui';
import { PASSOS } from './steps';
import Planos from './Planos';
import Apresentacao from './Apresentacao';

const idxPlano = PASSOS.findIndex((p) => p.id === 'plano');
const SALVAR_APOS_MS = 300;
const STATUS_TEXTO = { completo: 'concluída', parcial: 'em andamento', vazio: 'não iniciada' };

const passoValido = (n) => (Number.isInteger(n) && n >= 0 && n < PASSOS.length ? n : 0);

/* Ao chegar no one-pager pela primeira vez, traz as respostas das etapas anteriores. */
function aoEntrar(state, passo) {
  if (passo !== idxPlano || state.ui.preenchido) return state;
  const { state: novo } = preencherVazios(state);
  return { ...novo, ui: { ...novo.ui, preenchido: true } };
}

function prepararPlano(state, passo = state.ui.passo) {
  const p = passoValido(passo);
  return aoEntrar({ ...state, ui: { ...state.ui, passo: p } }, p);
}

export default function PlanoApp() {
  const [planoId, setPlanoId] = useState(null);
  const [state, setState] = useState(null);
  const [salvo, setSalvo] = useState(false);
  const [falhaAoSalvar, setFalhaAoSalvar] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [planosAberto, setPlanosAberto] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [apresentando, setApresentando] = useState(false);
  const stepRef = useRef(null);
  const stepperRef = useRef(null);
  const timers = useRef({});
  const pendente = useRef(null);
  const ignorarSalvamento = useRef(false);
  const planoIdRef = useRef(null);
  const botaoApresentar = useRef(null);
  const focarApresentar = useRef(false);

  useEffect(() => { planoIdRef.current = planoId; }, [planoId]);

  const toast = useCallback((msg, acao) => {
    setAviso({ msg, acao, chave: Date.now() });
    clearTimeout(timers.current.toast);
    timers.current.toast = setTimeout(() => setAviso(null), acao ? 8000 : 2600);
  }, []);

  /* Grava imediatamente o que estiver pendente (troca de plano, aba oculta, saída da página). */
  const flush = useCallback(() => {
    const p = pendente.current;
    if (!p) return;
    pendente.current = null;
    clearTimeout(timers.current.salvar);
    const ok = salvarPlano(p.id, p.state);
    setFalhaAoSalvar(!ok);
    if (ok) {
      setSalvo(true);
      clearTimeout(timers.current.salvo);
      timers.current.salvo = setTimeout(() => setSalvo(false), 1400);
    }
  }, []);

  const carregar = useCallback((id, plano, passo) => {
    flush();
    definirAtivo(id);
    ignorarSalvamento.current = true;
    setPlanoId(id);
    setState(prepararPlano(plano, passo));
  }, [flush]);

  // localStorage só existe no navegador: carrega após a montagem.
  useEffect(() => {
    const { id, state: inicial, disponivel } = inicializar();
    const doHash = PASSOS.findIndex((p) => p.id === window.location.hash.slice(1));
    /* eslint-disable react-hooks/set-state-in-effect -- sincroniza com o localStorage após a hidratação */
    carregar(id, inicial, doHash >= 0 ? doHash : inicial.ui.passo);
    setFalhaAoSalvar(!disponivel);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [carregar]);

  // Salvamento com debounce para não serializar o plano a cada tecla.
  useEffect(() => {
    if (!state || !planoId) return;
    if (ignorarSalvamento.current) { ignorarSalvamento.current = false; return; }
    pendente.current = { id: planoId, state };
    clearTimeout(timers.current.salvar);
    timers.current.salvar = setTimeout(flush, SALVAR_APOS_MS);
  }, [state, planoId, flush]);

  useEffect(() => {
    const t = timers.current;
    const aoOcultar = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', aoOcultar);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', aoOcultar);
      flush();
      Object.values(t).forEach(clearTimeout);
    };
  }, [flush]);

  // Mantém abas abertas em sincronia: a última alteração salva vale para todas.
  useEffect(() => {
    if (!planoId) return undefined;
    const aoMudar = (e) => {
      if (e.key !== chavePlano(planoId)) return;
      pendente.current = null;
      clearTimeout(timers.current.salvar);
      if (e.newValue === null) {
        let { ativo } = lerIndice();
        if (!ativo) ativo = criarPlano()?.id;
        const outro = ativo && carregarPlano(ativo);
        if (outro) carregar(ativo, outro);
        toast('Este plano foi excluído em outra aba.');
        return;
      }
      const atualizado = carregarPlano(planoId);
      if (!atualizado) return;
      ignorarSalvamento.current = true;
      setState((s) => ({ ...atualizado, ui: { ...atualizado.ui, passo: s.ui.passo } }));
      toast('Plano atualizado com as alterações de outra aba.');
    };
    window.addEventListener('storage', aoMudar);
    return () => window.removeEventListener('storage', aoMudar);
  }, [planoId, carregar, toast]);

  const passo = state ? state.ui.passo : 0;
  const carregado = !!state;

  useEffect(() => {
    if (!carregado) return;
    const id = PASSOS[passo].id;
    if (window.location.hash.slice(1) !== id) window.history.replaceState(null, '', `#${id}`);
    const atual = stepperRef.current?.querySelector('.is-current');
    atual?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }, [passo, carregado]);

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

  const baixarMarkdown = useCallback(() => {
    baixarArquivo(gerarMarkdown(state), nomeArquivo(state, 'md'), 'text/markdown;charset=utf-8');
    toast('Markdown baixado. Abra no Notion, no GitHub ou no seu editor favorito.');
  }, [state, toast]);

  const copiarMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(gerarMarkdown(state));
      toast('Markdown copiado. É só colar no Notion ou no GitHub.');
    } catch {
      toast('Não foi possível copiar. Use “Baixar Markdown”.');
    }
  }, [state, toast]);

  /* ---- Vários planos ---- */
  const atualizarLista = useCallback(() => setPlanos(listarPlanos()), []);

  const abrirPlanos = useCallback(() => {
    flush();
    atualizarLista();
    setPlanosAberto(true);
  }, [flush, atualizarLista]);

  const abrirPlano = useCallback((id) => {
    flush();
    const plano = carregarPlano(id);
    if (!plano) { toast('Não encontrei esse plano.'); atualizarLista(); return; }
    carregar(id, plano);
    setPlanosAberto(false);
    window.scrollTo({ top: 0 });
    toast(`Plano “${tituloDoPlano(plano)}” aberto.`);
  }, [flush, carregar, toast, atualizarLista]);

  const novoPlano = useCallback((criado, msg) => {
    if (!criado) { toast('Não foi possível criar o plano neste navegador.'); return; }
    carregar(criado.id, criado.state, 0);
    setPlanosAberto(false);
    window.scrollTo({ top: 0 });
    toast(msg);
  }, [carregar, toast]);

  const excluir = useCallback((id, titulo) => {
    if (!window.confirm(`Excluir o plano “${titulo}”? Você poderá desfazer logo em seguida.`)) return;
    flush();
    const eraAtual = id === planoIdRef.current;
    const desfazer = excluirPlano(id);
    // Ao excluir o único plano, um plano em branco é criado; o "desfazer" remove esse provisório se não foi usado.
    let provisorio = null;
    if (eraAtual) {
      let { ativo } = lerIndice();
      if (!ativo) { provisorio = criarPlano(); ativo = provisorio?.id; }
      const proximo = ativo && carregarPlano(ativo);
      if (proximo) carregar(ativo, proximo);
    }
    atualizarLista();
    toast('Plano excluído.', {
      label: 'Desfazer',
      onClick: () => {
        flush();
        if (!restaurarPlano(desfazer)) return;
        if (provisorio) {
          const atual = carregarPlano(provisorio.id);
          if (atual && progressoGeral(atual) === 0) excluirPlano(provisorio.id);
        }
        if (eraAtual) carregar(desfazer.id, desfazer.state);
        else definirAtivo(planoIdRef.current); // restaurarPlano marca o restaurado como ativo
        atualizarLista();
      },
    });
  }, [flush, carregar, atualizarLista, toast]);

  const limparPlano = useCallback(() => {
    if (!window.confirm('Apagar todas as respostas deste plano? Você poderá desfazer logo em seguida.')) return;
    const id = planoIdRef.current;
    const anterior = state;
    setState(estadoInicial({ titulo: anterior.titulo }));
    setPlanosAberto(false);
    window.scrollTo({ top: 0 });
    toast('Respostas apagadas.', {
      label: 'Desfazer',
      onClick: () => {
        if (planoIdRef.current === id) setState(anterior);
        else salvarPlano(id, anterior);
      },
    });
  }, [state, toast]);

  const exportar = useCallback(() => {
    flush();
    const backup = gerarBackup();
    baixarArquivo(JSON.stringify(backup, null, 2), `backup-plano-de-carreira-${hojeLocal()}.json`, 'application/json');
    toast(`Backup com ${backup.planos.length} plano(s) baixado.`);
  }, [flush, toast]);

  const importar = useCallback(async (arquivo) => {
    try {
      if (arquivo.size > MAX_BACKUP_BYTES) throw new Error('Arquivo grande demais para ser um backup do plano.');
      let dados;
      try { dados = JSON.parse(await arquivo.text()); } catch { throw new Error('O arquivo não é um JSON válido.'); }
      flush();
      const { criados, ignorados } = importarBackup(dados);
      atualizarLista();
      novoPlano(criados[0], `${criados.length} plano(s) importado(s)${ignorados ? `; ${ignorados} ignorado(s) pelo limite` : ''}.`);
    } catch (err) {
      toast(err.message || 'Não foi possível importar o backup.');
    }
  }, [flush, atualizarLista, novoPlano, toast]);

  /* ---- Modo apresentação ---- */
  const abrirApresentacao = () => {
    setApresentando(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };
  const sairApresentacao = useCallback(() => {
    focarApresentar.current = true;
    setApresentando(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    if (apresentando || !focarApresentar.current) return;
    focarApresentar.current = false;
    botaoApresentar.current?.focus();
  }, [apresentando]);

  const ctx = useMemo(
    () => ({ state, set, update, toast, irPara, baixar, gerandoPdf, baixarMarkdown, copiarMarkdown, abrirPlanos }),
    [state, set, update, toast, irPara, baixar, gerandoPdf, baixarMarkdown, copiarMarkdown, abrirPlanos],
  );

  if (apresentando) return <Apresentacao etapaInicial={PASSOS[passo].id} onSair={sairApresentacao} />;

  const Passo = PASSOS[passo].Componente;
  const geral = state ? progressoGeral(state) : 0;

  // Com o diálogo modal aberto, o resto da página fica inerte: o toast vai para dentro dele.
  const toastEl = (
    <div className={`toast${aviso ? ' is-visible' : ''}${aviso?.acao ? ' has-action' : ''}`} role="status" aria-live="polite">
      {aviso?.msg}
      {aviso?.acao && (
        <button type="button" className="toast__acao" onClick={() => { aviso.acao.onClick(); setAviso(null); }}>
          {aviso.acao.label}
        </button>
      )}
    </div>
  );

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
          <div className="topbar__acoes">
            <button className="btn btn--ghost btn--sm" type="button" onClick={abrirApresentacao} aria-label="Apresentar" ref={botaoApresentar}
              title="Mostrar as etapas em tela cheia, sem respostas, para projetar na mentoria">
              <span aria-hidden="true">▶</span><span className="topbar__rotulo">Apresentar</span>
            </button>
            <button className="btn btn--ghost btn--sm topbar__plano" type="button" onClick={abrirPlanos} disabled={!state}
              aria-label={`Meus planos: ${state ? tituloDoPlano(state) : ''}`} aria-haspopup="dialog"
              title="Trocar de plano, criar um novo ou fazer backup">
              <span className="topbar__rotulo">Meus planos:</span>
              <span className="topbar__nome">{state ? tituloDoPlano(state) : '…'}</span>
              <span aria-hidden="true">▾</span>
            </button>
          </div>
        </div>
        <div className="stripe" aria-hidden="true" />
      </header>

      <nav className="stepper" aria-label="Etapas">
        <div className="container">
          <ol className="stepper__list" ref={stepperRef}>
            {PASSOS.map((p, i) => {
              const status = state ? statusEtapa(state, p.id) : 'vazio';
              const { feitos, total } = state ? progressoEtapa(state, p.id) : { feitos: 0, total: 0 };
              return (
                <li key={p.id} className={`${i === passo ? 'is-current' : ''} is-${status}`}>
                  <button type="button" onClick={() => irPara(i)} aria-current={i === passo ? 'step' : undefined} disabled={!state}
                    aria-label={`${p.label}: ${STATUS_TEXTO[status]}`} title={`${feitos} de ${total} itens preenchidos`}>
                    <span className="stepper__n mono">{status === 'completo' ? '✓' : i === 0 ? '★' : i}</span>
                    <span className="stepper__l">{p.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      <main className="container main">
        {falhaAoSalvar && (
          <div className="aviso aviso--erro" role="alert">
            Não foi possível salvar neste navegador (modo privado ou armazenamento cheio). Baixe seu PDF ou Markdown antes de
            fechar a página.
          </div>
        )}
        <div className="progress-wrap">
          <div className="progress" role="progressbar" aria-label="Plano preenchido" aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={geral}>
            <div className="progress__bar" style={{ width: `${geral}%` }} />
          </div>
          <span className="mono muted progress__txt">{geral}% preenchido</span>
        </div>
        <p className="sr-only" aria-live="polite">
          {state ? `Etapa ${passo + 1} de ${PASSOS.length}: ${PASSOS[passo].label}` : ''}
        </p>
        <section className="step" key={`${planoId}-${passo}`} ref={stepRef} tabIndex={-1} aria-label={PASSOS[passo].label}>
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

      {state && (
        <Planos
          aberto={planosAberto}
          onFechar={() => setPlanosAberto(false)}
          planoId={planoId}
          state={state}
          planos={planos}
          podeCriar={podeCriarPlano()}
          onRenomear={(v) => set('titulo', v)}
          onAbrir={abrirPlano}
          onCriar={() => { flush(); novoPlano(criarPlano(), 'Novo plano criado.'); }}
          onDuplicar={(id) => { flush(); novoPlano(duplicarPlano(id), 'Plano duplicado. Você está editando a cópia.'); }}
          onExcluir={excluir}
          onLimpar={limparPlano}
          onExportar={exportar}
          onImportar={importar}
        >
          {planosAberto && toastEl}
        </Planos>
      )}

      {!planosAberto && toastEl}
    </AppContext.Provider>
  );
}
