'use client';

import { useEffect, useRef } from 'react';
import { tituloDoPlano } from '@/lib/data';
import { formatarDataHora } from '@/lib/datas';
import { progressoGeral } from '@/lib/progresso';

export default function Planos({
  aberto, onFechar, planoId, state, planos, onRenomear, onAbrir, onCriar, onDuplicar, onExcluir, onLimpar,
  onExportar, onImportar, podeCriar, children,
}) {
  const dialogo = useRef(null);
  const arquivo = useRef(null);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  // O plano atual pode ter mudanças ainda não listadas; usa o estado em memória.
  const lista = planos.map((p) => (p.id === planoId
    ? { ...p, titulo: tituloDoPlano(state), nome: state.nome, progresso: progressoGeral(state) }
    : p));

  return (
    <dialog ref={dialogo} className="dialogo" aria-labelledby="planos-titulo" onClose={onFechar}
      onClick={(e) => { if (e.target === dialogo.current) onFechar(); }}>
      <div className="dialogo__corpo">
        <header className="dialogo__head">
          <h2 id="planos-titulo">Meus planos</h2>
          <button type="button" className="icon-btn" onClick={onFechar} aria-label="Fechar">×</button>
        </header>

        <label className="field">
          <span className="field__label">Nome deste plano</span>
          <input type="text" value={state.titulo} placeholder={tituloDoPlano({ ...state, titulo: '' })}
            onChange={(e) => onRenomear(e.target.value)} maxLength={60} />
          <span className="field__hint">Ex.: “Transição para dados”, “Plano B: UX”.</span>
        </label>

        <ul className="planos">
          {lista.map((p) => {
            const atual = p.id === planoId;
            return (
              <li key={p.id} className={atual ? 'is-current' : ''}>
                <div className="planos__info">
                  <strong>{p.titulo}</strong>
                  <span className="muted small">
                    {[p.nome, `${p.progresso}% preenchido`, p.atualizadoEm && `editado em ${formatarDataHora(p.atualizadoEm)}`]
                      .filter(Boolean).join(' · ')}
                  </span>
                </div>
                <div className="planos__acoes">
                  {atual
                    ? <span className="mono planos__tag">Aberto</span>
                    : <button type="button" className="btn btn--sm btn--dark" onClick={() => onAbrir(p.id)}>Abrir</button>}
                  <button type="button" className="btn btn--sm btn--outline" onClick={() => onDuplicar(p.id)} disabled={!podeCriar}
                    aria-label={`Duplicar ${p.titulo}`}>Duplicar</button>
                  <button type="button" className="btn btn--sm btn--outline" onClick={() => onExcluir(p.id, p.titulo)}
                    aria-label={`Excluir ${p.titulo}`}>Excluir</button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="dialogo__acoes">
          <button type="button" className="btn btn--primary btn--sm" onClick={onCriar} disabled={!podeCriar}>+ Novo plano em branco</button>
          <button type="button" className="btn btn--outline btn--sm" onClick={onLimpar}>Apagar respostas deste plano</button>
        </div>

        <section className="dialogo__backup">
          <h3>Backup</h3>
          <p className="muted small">
            Seus planos ficam só neste navegador. Para não perder nada ao limpar o histórico ou trocar de computador,
            exporte um backup e importe-o quando precisar.
          </p>
          <div className="dialogo__acoes">
            <button type="button" className="btn btn--dark btn--sm" onClick={onExportar}>Exportar backup (.json)</button>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => arquivo.current?.click()} disabled={!podeCriar}>
              Importar backup
            </button>
            <input ref={arquivo} type="file" accept=".json,application/json" hidden
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onImportar(f); }} />
          </div>
        </section>
      </div>
      {children}
    </dialog>
  );
}
