'use client';

import { DIMENSOES, QUADRANTES, quadrante } from '@/lib/data';
import { useApp } from './ui';

export function RadarChart() {
  const { state } = useApp();
  const size = 340; const c = size / 2; const r = 110;
  const pt = (i, v) => {
    const a = (-90 + i * 72) * Math.PI / 180;
    return [c + Math.cos(a) * r * v / 5, c + Math.sin(a) * r * v / 5];
  };
  const nota = (d) => Number(state.radar[d.id].nota) || 0;
  return (
    <svg viewBox={`-40 -10 ${size + 80} ${size + 20}`} className="radar" role="img" aria-label="Radar de carreira">
      {[1, 2, 3, 4, 5].map((n) => (
        <polygon key={n} points={DIMENSOES.map((_, i) => pt(i, n).join(',')).join(' ')}
          className={`radar__grid${n === 5 ? ' radar__grid--outer' : ''}`} />
      ))}
      {DIMENSOES.map((d, i) => { const [x, y] = pt(i, 5); return <line key={d.id} x1={c} y1={c} x2={x} y2={y} className="radar__axis" />; })}
      <polygon points={DIMENSOES.map((d, i) => pt(i, nota(d)).join(',')).join(' ')} className="radar__data" />
      {DIMENSOES.map((d, i) => { const [x, y] = pt(i, nota(d)); return <circle key={d.id} cx={x} cy={y} r="4.5" className="radar__dot" />; })}
      {DIMENSOES.map((d, i) => {
        const [x, y] = pt(i, 6.3);
        const anchor = Math.abs(x - c) < 5 ? 'middle' : x > c ? 'start' : 'end';
        return (
          <text key={d.id} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="radar__label">
            {d.nome}<tspan x={x} dy="15" className="radar__val">{nota(d)}/5</tspan>
          </text>
        );
      })}
    </svg>
  );
}

/* Ações com a mesma classificação ficam em grade dentro da célula. */
function posicoesMatriz(itens) {
  const grupos = {};
  itens.forEach((m, idx) => {
    if (!m.acao.trim()) return;
    const k = `${m.impacto}-${m.esforco}`;
    (grupos[k] = grupos[k] || []).push({ ...m, idx });
  });
  return Object.values(grupos).flatMap((g) => {
    const cols = Math.ceil(Math.sqrt(g.length)); const rows = Math.ceil(g.length / cols);
    return g.map((m, j) => ({
      ...m,
      r: g.length > 1 ? 9 : 11,
      dx: ((j % cols) - (cols - 1) / 2) * 21,
      dy: (Math.floor(j / cols) - (rows - 1) / 2) * 21,
    }));
  });
}

export function MatrizChart() {
  const { state } = useApp();
  const W = 360; const H = 300; const L = 30; const B = 30;
  const w = W - L; const h = H - B;
  const itens = posicoesMatriz(state.matriz);
  const quads = [['agora', 0, 0], ['planeje', 1, 0], ['avalie', 0, 1], ['depois', 1, 1]];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx" role="img" aria-label={`Matriz impacto por esforço com ${itens.length} ações`}>
      {quads.map(([k, x, y]) => (
        <g key={k}>
          <rect x={L + x * w / 2} y={y * h / 2} width={w / 2} height={h / 2} className={`mx__q mx__q--${k}`} />
          <text x={L + x * w / 2 + 10} y={y * h / 2 + 20} className="mx__qt">{QUADRANTES[k].titulo}</text>
        </g>
      ))}
      <text x={L + w / 2} y={H - 8} textAnchor="middle" className="mx__axis">Esforço →</text>
      <text x="12" y={h / 2} textAnchor="middle" className="mx__axis" transform={`rotate(-90 12 ${h / 2})`}>Impacto →</text>
      {itens.map((m) => {
        const cx = L + ((m.esforco - 0.5) / 4) * w + m.dx;
        const cy = (1 - (m.impacto - 0.5) / 4) * h + m.dy;
        return (
          <g key={m.idx} className="mx__pt">
            <circle cx={cx} cy={cy} r={m.r} />
            <text x={cx} y={cy} dominantBaseline="central" textAnchor="middle">{m.idx + 1}</text>
            <title>{m.acao}</title>
          </g>
        );
      })}
    </svg>
  );
}

export function ResumoQuadrantes() {
  const { state } = useApp();
  return (
    <div className="qsums">
      {Object.entries(QUADRANTES).map(([k, q]) => {
        const itens = state.matriz.map((m, i) => ({ ...m, i })).filter((m) => m.acao.trim() && quadrante(m) === k);
        return (
          <div key={k} className={`qsum qsum--${k}`}>
            <strong>{q.titulo}</strong>
            <span className="mono">{q.desc}</span>
            {itens.length
              ? <ul>{itens.map((m) => <li key={m.i}><b>{m.i + 1}</b> {m.acao}</li>)}</ul>
              : <p className="muted">—</p>}
          </div>
        );
      })}
    </div>
  );
}
