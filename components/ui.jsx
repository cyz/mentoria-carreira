'use client';

import { createContext, useContext, useId } from 'react';
import { getPath } from '@/lib/state';

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function Campo({ path, label, rows, placeholder, hint, type = 'text', aria, className = '' }) {
  const { state, set } = useApp();
  const id = useId();
  const value = getPath(state, path) ?? '';
  const props = {
    id,
    value,
    placeholder,
    'aria-label': aria,
    'data-path': path,
    onChange: (e) => set(path, e.target.value),
  };
  return (
    <div className={`field ${className}`}>
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      {hint && <span className="field__hint">{hint}</span>}
      {rows ? <textarea rows={rows} {...props} /> : <input type={type} {...props} />}
    </div>
  );
}

export function Dica({ titulo = 'Dica', children }) {
  return (
    <aside className="tip">
      <span className="tip__label mono">{titulo}</span>
      <p>{children}</p>
    </aside>
  );
}

export function Cabecalho({ num, kicker, titulo, children }) {
  return (
    <header className="step__head">
      <span className="kicker mono">{num && <><b>{num}</b> · </>}{kicker}</span>
      <h1>{titulo}</h1>
      {children && <p className="lead">{children}</p>}
    </header>
  );
}
