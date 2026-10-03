/* Geração do PDF "Meu Plano de Carreira" com a identidade visual da WoMakersCode. */
import {
  BRAND, DIMENSOES, GAPS, FASES, CADEIA, NIVEIS, QUADRANTES, quadrante, REFLEXAO, PLANO_CAMPOS, PROXIMO, descreverExperimento,
} from './data';
import logoImg from '@/assets/img/logo-womakerscode.png';
import borboletaImg from '@/assets/img/borboleta.png';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const W = 210; const H = 297; const M = 16; const CW = W - 2 * M;
const FOOTER_Y = H - 12; const LIMITE = H - 22;
const PT = 0.3528; // mm por ponto
const LH = 1.38;

const FONTES = [
  ['Inter-Regular.ttf', 'Inter', 'normal'],
  ['Inter-Bold.ttf', 'Inter', 'bold'],
  ['IBMPlexMono-Regular.ttf', 'PlexMono', 'normal'],
  ['IBMPlexMono-SemiBold.ttf', 'PlexMono', 'bold'],
];
const cache = { fontes: null, imgs: null };

function bufferParaBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function carregarFontes() {
  if (cache.fontes !== null) return cache.fontes;
  try {
    cache.fontes = await Promise.all(FONTES.map(async ([arq, fam, est]) => {
      const r = await fetch(`${BASE_PATH}/fonts/${arq}`);
      if (!r.ok) throw new Error(arq);
      return { arq, fam, est, b64: bufferParaBase64(await r.arrayBuffer()) };
    }));
  } catch (e) {
    console.warn('Fontes indisponíveis, usando Helvetica.', e);
    cache.fontes = false;
  }
  return cache.fontes;
}

async function carregarImagem(src) {
  const r = await fetch(src);
  const blob = await r.blob();
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
}

async function carregarImagens() {
  if (cache.imgs) return cache.imgs;
  const [logo, borboleta] = await Promise.all([
    carregarImagem(logoImg.src),
    carregarImagem(borboletaImg.src),
  ]);
  cache.imgs = { logo, borboleta };
  return cache.imgs;
}

const formatarData = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
};
const slug = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function criar(state, fontes, imgs, jsPDF) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const temFontes = !!fontes;
  if (temFontes) fontes.forEach((f) => { doc.addFileToVFS(f.arq, f.b64); doc.addFont(f.arq, f.fam, f.est); });
  const FAM = { sans: temFontes ? 'Inter' : 'helvetica', mono: temFontes ? 'PlexMono' : 'courier' };

  // Remove emojis e, sem as fontes Unicode, troca símbolos fora do WinAnsi.
  const limpar = (s) => {
    let t = String(s == null ? '' : s).replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, '').replace(/\r/g, '').replace(/[ \t]{2,}/g, ' ');
    if (!temFontes) t = t.replace(/→/g, '->').replace(/…/g, '...').replace(/[^\x00-\xFF\n]/g, '');
    return t.trim();
  };

  let y = M;
  let secaoAtual = '';

  /* ---- primitivas ---- */
  function fonte(f = 'sans', estilo = 'normal', tam = 10, cor = BRAND.black) {
    doc.setFont(FAM[f], estilo);
    doc.setFontSize(tam);
    doc.setTextColor(cor);
  }
  const lh = (tam) => tam * PT * LH;
  function linhas(texto, largura, f = 'sans', estilo = 'normal', tam = 10) {
    fonte(f, estilo, tam);
    const t = limpar(texto);
    if (!t) return [];
    return doc.splitTextToSize(t, largura);
  }
  function escrever(texto, x, yy, o = {}) {
    const tam = o.tam || 10;
    fonte(o.f || 'sans', o.estilo || 'normal', tam, o.cor || BRAND.black);
    const ls = Array.isArray(texto) ? texto : (o.largura ? doc.splitTextToSize(limpar(texto), o.largura) : [limpar(texto)]);
    const opts = { baseline: 'top', lineHeightFactor: LH };
    if (o.align) opts.align = o.align;
    if (o.charSpace) opts.charSpace = o.charSpace;
    doc.text(ls, x, yy, opts);
    return ls.length * lh(tam);
  }
  function mono(texto, x, yy, o = {}) {
    return escrever(limpar(texto).toUpperCase(), x, yy, { f: 'mono', estilo: 'bold', tam: 7.5, charSpace: 0.35, ...o });
  }
  function caixa(x, yy, w, h, o = {}) {
    const r = o.r == null ? 2.5 : o.r;
    if (o.fill) doc.setFillColor(o.fill);
    if (o.stroke) { doc.setDrawColor(o.stroke); doc.setLineWidth(o.lw || 0.3); }
    const estilo = o.fill && o.stroke ? 'FD' : o.fill ? 'F' : 'S';
    if (r) doc.roundedRect(x, yy, w, h, r, r, estilo); else doc.rect(x, yy, w, h, estilo);
  }
  function faixa(yy, h) {
    const seg = W / BRAND.butterfly.length;
    BRAND.butterfly.forEach((c, i) => { doc.setFillColor(c); doc.rect(i * seg, yy, seg + 0.2, h, 'F'); });
  }
  function linhasEmBranco(x, yy, w, n, cor = BRAND.gray[200]) {
    doc.setDrawColor(cor); doc.setLineWidth(0.25);
    for (let i = 1; i <= n; i++) doc.line(x, yy + i * 6.5, x + w, yy + i * 6.5);
    return n * 6.5 + 1.5;
  }
  function poligono(pts, estilo) {
    const [x0, y0] = pts[0];
    const deltas = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
    doc.lines(deltas, x0, y0, [1, 1], estilo, true);
  }

  /* ---- páginas ---- */
  function cabecalhoPequeno(kicker) {
    doc.setFillColor(BRAND.dark); doc.rect(0, 0, W, 20, 'F');
    doc.addImage(imgs.logo, 'PNG', M, 5.5, 9 * 827 / 270, 9);
    mono(kicker, W - M, 8.2, { cor: BRAND.pink, align: 'right' });
    faixa(20, 1.6);
  }
  function novaPagina(kicker) {
    doc.addPage();
    cabecalhoPequeno(kicker);
    y = 32;
  }
  function garantir(h) {
    if (y + h > LIMITE) novaPagina(`${secaoAtual} · continuação`);
  }
  /* Começa a seção numa nova página, ou na mesma se sobrar pelo menos `minEspaco` mm. */
  function tituloSecao(num, kicker, titulo, sub, minEspaco = Infinity) {
    secaoAtual = `${num} · ${kicker}`;
    if (LIMITE - y >= minEspaco) {
      y += 4;
      doc.setDrawColor(BRAND.gray[200]); doc.setLineWidth(0.3); doc.line(M, y, M + CW, y);
      y += 6;
      y += mono(secaoAtual, M, y, { cor: '#c43a72' }) + 1;
    } else {
      novaPagina(secaoAtual);
    }
    y += escrever(titulo, M, y, { estilo: 'bold', tam: 20 }) + 1;
    if (sub) y += escrever(sub, M, y, { tam: 10, cor: BRAND.gray[600], largura: CW });
    y += 6;
  }
  function subtitulo(t, reservar = 30) {
    garantir(10 + reservar);
    doc.setFillColor(BRAND.pink); doc.rect(M, y + 0.6, 1.2, 4.6, 'F');
    y += escrever(t, M + 4, y, { estilo: 'bold', tam: 12 }) + 3;
  }
  function dica(texto, rotulo = 'Dica', opcional = false) {
    const ls = linhas(texto, CW - 12, 'sans', 'normal', 9.5);
    const h = 9 + ls.length * lh(9.5) + 3;
    if (opcional && y + h > LIMITE) return;
    garantir(h + 4);
    caixa(M, y, CW, h, { fill: BRAND.pinkSoft, r: 2 });
    doc.setFillColor(BRAND.pink); doc.rect(M, y, 1.4, h, 'F');
    mono(rotulo, M + 6, y + 4, { cor: '#c43a72' });
    escrever(ls, M + 6, y + 8.5, { tam: 9.5, cor: BRAND.gray[700] });
    y += h + 6;
  }

  /* Grade de cartões com título, prompt e resposta (altura igual por linha).
     Com `o.medir`, só calcula a altura total sem desenhar. */
  function cartoes(itens, cols, o = {}) {
    const s = o.escala || 1;
    const gap = 4; const pad = 4.2 * s;
    const tT = 10.5 * s; const tP = 8.5 * s; const tR = 9.5 * s; const tN = 8 * s;
    const cw = (CW - gap * (cols - 1)) / cols;
    const medir = (it, w) => {
      const iw = w - 2 * pad - (o.barra ? 1 : 0);
      const tit = linhas(it.titulo, iw, 'sans', 'bold', tT);
      const pr = it.prompt ? linhas(it.prompt, iw, 'sans', 'normal', tP) : [];
      const resp = linhas(it.texto, iw, 'sans', 'normal', tR);
      let h = pad + (it.num ? 4.2 * s : 0) + tit.length * lh(tT) + (pr.length ? pr.length * lh(tP) + 0.8 : 0) + 1.6 * s;
      h += resp.length ? resp.length * lh(tR) : 2 * 6.5 + 1.5;
      return { tit, pr, resp, h: h + pad };
    };
    let total = 0;
    for (let i = 0; i < itens.length; i += cols) {
      const linha = itens.slice(i, i + cols);
      const larg = (linha.length === 1 && o.ultimoInteiro) ? CW : cw;
      const ms = linha.map((it) => medir(it, larg));
      const hRow = Math.max(...ms.map((m) => m.h), o.minH || 0);
      total += hRow + gap;
      if (o.medir) continue;
      garantir(hRow + gap);
      linha.forEach((it, j) => {
        const x = M + j * (cw + gap);
        const m = ms[j];
        caixa(x, y, larg, hRow, { fill: '#ffffff', stroke: BRAND.gray[200], r: 2.5 });
        if (o.barra) { doc.setFillColor(o.barra); doc.rect(x, y + 2.5, 1.2, hRow - 5, 'F'); }
        let yy = y + pad;
        if (it.num) { mono(it.num, x + pad, yy, { cor: '#c43a72', tam: tN }); yy += 4.2 * s; }
        yy += escrever(m.tit, x + pad, yy, { estilo: 'bold', tam: tT });
        if (m.pr.length) yy += escrever(m.pr, x + pad, yy, { tam: tP, cor: BRAND.gray[500] }) + 0.8;
        yy += 1.6 * s;
        if (m.resp.length) escrever(m.resp, x + pad, yy, { tam: tR });
        else linhasEmBranco(x + pad, yy - 2.5, larg - 2 * pad, 2);
      });
      y += hRow + gap;
    }
    return total;
  }

  /* Bloco escuro "Meu próximo passo". */
  function proximoPasso(s, medir) {
    const pad = 6 * s; const iw = CW - 2 * pad - 16;
    const tP = 8.5 * s; const tR = 11 * s;
    const blocos = PROXIMO.map((p) => ({ p, resp: linhas(state.proximo[p.id], iw, 'sans', 'bold', tR) }));
    const h = pad + 5 * s + blocos.reduce((acc, b) => acc + lh(tP) + 0.8 + (b.resp.length ? b.resp.length * lh(tR) : 8) + 3 * s, 0) + pad - 3 * s;
    if (medir) return h;
    garantir(h);
    caixa(M, y, CW, h, { fill: BRAND.dark, r: 3 });
    doc.addImage(imgs.borboleta, 'PNG', W - M - 6 - 11, y + 5, 11, 11 * 266 / 300);
    let yy = y + pad;
    mono('Meu próximo passo', M + pad, yy, { cor: BRAND.pink, tam: 8 });
    yy += 5 * s;
    blocos.forEach((b) => {
      yy += escrever(`${b.p.prompt}…`, M + pad, yy, { tam: tP, cor: BRAND.gray[300] }) + 0.8;
      if (b.resp.length) yy += escrever(b.resp, M + pad, yy, { estilo: 'bold', tam: tR, cor: '#ffffff' });
      else { doc.setDrawColor(BRAND.gray[600]); doc.setLineWidth(0.25); doc.line(M + pad, yy + 6, M + CW - pad - 16, yy + 6); yy += 8; }
      yy += 3 * s;
    });
    y += h + 4;
    return h;
  }

  /* ================= Página 1 · One-pager ================= */
  doc.setFillColor(BRAND.dark); doc.rect(0, 0, W, 34, 'F');
  doc.addImage(imgs.logo, 'PNG', M, 10, 14 * 827 / 270, 14);
  mono('Mentoria de carreira', W - M, 11, { cor: BRAND.pink, align: 'right' });
  escrever('Plano de carreira:', W - M, 16, { estilo: 'bold', tam: 11, cor: '#ffffff', align: 'right' });
  escrever('da intenção à ação', W - M, 21, { estilo: 'bold', tam: 11, cor: BRAND.pink, align: 'right' });
  faixa(34, 2.2);
  y = 45;
  mono('One-pager', M, y, { cor: '#c43a72' });
  y += 4.5;
  y += escrever('Meu Plano de Carreira', M, y, { estilo: 'bold', tam: 24 });
  const meta = [limpar(state.nome), formatarData(state.data)].filter(Boolean).join('  ·  ');
  if (meta) y += escrever(meta, M, y + 0.5, { tam: 11.5, cor: BRAND.gray[600] }) + 1;
  y += 2.5;
  doc.setFillColor(BRAND.pink); doc.rect(M, y, 1.2, 5, 'F');
  y += escrever('Você não precisa ter todas as respostas. Precisa saber qual é o próximo passo.', M + 4, y + 0.3, { tam: 9.5, cor: BRAND.gray[600] }) + 5;
  secaoAtual = 'Meu plano de carreira';

  const itensPlano = PLANO_CAMPOS.map((p, i) => ({
    num: String(i + 1).padStart(2, '0'), titulo: p.titulo, prompt: p.prompt, texto: state.plano[p.id],
  }));
  // Reduz a escala até o one-pager caber numa única página (limite mínimo de legibilidade).
  let escala = 1;
  for (const s of [1, 0.94, 0.88, 0.82, 0.76]) {
    escala = s;
    if (y + cartoes(itensPlano, 3, { medir: true, escala: s }) + proximoPasso(s, true) <= LIMITE) break;
  }
  cartoes(itensPlano, 3, { escala });
  proximoPasso(escala);

  /* ================= Radar + Onde estou ================= */
  const temRadar = DIMENSOES.some((d) => state.radar[d.id].texto.trim()) || state.direcao.trim();
  const temHoje = state.hoje.situacao.trim() || state.hoje.tenho.trim() || state.hoje.falta.trim();
  if (temRadar || temHoje) {
    tituloSecao('01', 'Radar de carreira', 'Onde quero chegar?', 'As 5 dimensões do radar e o quanto cada uma está clara para mim hoje (1 a 5).');

    // Gráfico radar
    const cx = M + 38; const cy = y + 36; const r = 24;
    const pt = (i, v) => { const a = (-90 + i * 72) * Math.PI / 180; return [cx + Math.cos(a) * r * v / 5, cy + Math.sin(a) * r * v / 5]; };
    for (let n = 5; n >= 1; n--) {
      doc.setDrawColor(n === 5 ? BRAND.gray[300] : BRAND.gray[200]); doc.setLineWidth(0.25);
      poligono(DIMENSOES.map((_, i) => pt(i, n)), 'S');
    }
    DIMENSOES.forEach((_, i) => { const [x2, y2] = pt(i, 5); doc.line(cx, cy, x2, y2); });
    doc.setFillColor('#ffc7db'); doc.setDrawColor(BRAND.pink); doc.setLineWidth(0.7);
    poligono(DIMENSOES.map((d, i) => pt(i, Number(state.radar[d.id].nota) || 0)), 'FD');
    DIMENSOES.forEach((d, i) => {
      const [px, py] = pt(i, Number(state.radar[d.id].nota) || 0);
      doc.setFillColor(BRAND.black); doc.circle(px, py, 0.9, 'F');
      const [lx, ly] = pt(i, 6.4);
      const align = Math.abs(lx - cx) < 2 ? 'center' : lx > cx ? 'left' : 'right';
      escrever(d.nome, lx, ly - 3, { estilo: 'bold', tam: 8.5, align });
      mono(`${state.radar[d.id].nota}/5`, lx, ly + 0.9, { cor: '#c43a72', tam: 7, align });
    });

    // Direção
    const bx = M + 96; const bw = CW - 96;
    const dirLs = linhas(state.direcao, bw - 12, 'sans', 'bold', 12);
    const bh = Math.max(30, 18 + (dirLs.length || 2) * lh(12) + 16);
    caixa(bx, y + 6, bw, bh, { fill: BRAND.pinkSoft, stroke: BRAND.pink, lw: 0.5, r: 3 });
    mono('Minha direção', bx + 6, y + 12, { cor: '#c43a72' });
    escrever('Quero me aproximar de…', bx + 6, y + 16.5, { tam: 8.5, cor: BRAND.gray[500] });
    if (dirLs.length) escrever(dirLs, bx + 6, y + 22, { estilo: 'bold', tam: 12 });
    else linhasEmBranco(bx + 6, y + 19, bw - 12, 2, BRAND.gray[300]);
    escrever('A interseção entre o que eu gosto, o que consigo desenvolver e onde existe oportunidade real.', bx + 6, y + 6 + bh - 11, { tam: 7.5, cor: BRAND.gray[600], largura: bw - 12 });
    y += Math.max(78, bh + 12);

    // Tabela das dimensões
    DIMENSOES.forEach((d) => {
      const resp = linhas(state.radar[d.id].texto, CW - 62, 'sans', 'normal', 9.5);
      const h = Math.max(13, 5 + (resp.length ? resp.length * lh(9.5) : 6.5) + 4);
      garantir(h);
      doc.setDrawColor(BRAND.gray[200]); doc.setLineWidth(0.25); doc.line(M, y, M + CW, y);
      escrever(d.nome, M, y + 3, { estilo: 'bold', tam: 10 });
      escrever(d.pergunta, M, y + 7.6, { tam: 7.5, cor: BRAND.gray[500], largura: 40 });
      for (let k = 0; k < 5; k++) {
        doc.setFillColor(k < state.radar[d.id].nota ? BRAND.pink : BRAND.gray[200]);
        doc.circle(M + 44 + k * 3.2, y + 5, 1.1, 'F');
      }
      if (resp.length) escrever(resp, M + 62, y + 3, { tam: 9.5 });
      else linhasEmBranco(M + 62, y - 2, CW - 62, 1);
      y += h;
    });
    doc.setDrawColor(BRAND.gray[200]); doc.line(M, y, M + CW, y);
    y += 8;

    if (temHoje) {
      subtitulo('Onde estou hoje?');
      if (state.hoje.situacao.trim()) {
        y += escrever([`Meu momento atual: ${limpar(state.hoje.situacao)}`].join(''), M, y, { tam: 10, cor: BRAND.gray[700], largura: CW }) + 3;
      }
      cartoes([
        { titulo: 'O que eu já tenho', texto: state.hoje.tenho },
        { titulo: 'O que está faltando', texto: state.hoje.falta },
      ], 2, { barra: BRAND.pink });
    }
  }

  /* ================= Career Gap ================= */
  const vagas = state.vagas.filter((v) => v.titulo.trim() || v.requisitos.trim());
  const temGap = state.cargoAlvo.trim() || vagas.length || state.recorrentes.trim()
    || state.prioridades.some((p) => p.trim()) || GAPS.some((g) => state.gap[g.id].trim());
  if (temGap) {
    tituloSecao('02', 'Career Gap', 'Meu Career Gap', 'Onde estou → Onde quero chegar → O que falta entre os dois?');

    // Fluxo
    const fw = (CW - 12) / 3;
    const fluxo = [
      { r: 'Onde estou', t: state.hoje.situacao, fill: '#ffffff' },
      { r: 'Onde quero chegar', t: state.cargoAlvo, fill: '#ffffff' },
      { r: 'O que falta', t: state.prioridades.filter((p) => p.trim()).join(' · '), fill: BRAND.dark },
    ];
    const fl = fluxo.map((f) => linhas(f.t, fw - 8, 'sans', 'bold', 9.5));
    const fh = 11 + Math.max(1, ...fl.map((l) => l.length)) * lh(9.5) + 4;
    fluxo.forEach((f, i) => {
      const x = M + i * (fw + 6);
      caixa(x, y, fw, fh, { fill: f.fill, stroke: i < 2 ? BRAND.gray[200] : null, r: 2.5 });
      mono(f.r, x + 4, y + 4, { cor: i < 2 ? BRAND.gray[600] : BRAND.pink, tam: 7 });
      if (fl[i].length) escrever(fl[i], x + 4, y + 9.5, { estilo: 'bold', tam: 9.5, cor: i < 2 ? BRAND.black : '#ffffff' });
      if (i < 2) escrever('→', x + fw + 1.2, y + fh / 2 - 2.5, { estilo: 'bold', tam: 11, cor: BRAND.pink });
    });
    y += fh + 8;

    if (vagas.length) {
      subtitulo('5 vagas → requisitos recorrentes');
      const c1 = 8; const c2 = 55; const c3 = CW - c1 - c2;
      garantir(10);
      caixa(M, y, CW, 7, { fill: BRAND.dark, r: 1.5 });
      mono('#', M + 3, y + 2.2, { cor: BRAND.pink, tam: 7 });
      mono('Cargo · empresa', M + c1 + 2, y + 2.2, { cor: BRAND.pink, tam: 7 });
      mono('Principais requisitos', M + c1 + c2 + 2, y + 2.2, { cor: BRAND.pink, tam: 7 });
      y += 7;
      vagas.forEach((v, i) => {
        const lt = linhas(v.titulo, c2 - 4, 'sans', 'bold', 9);
        const lr = linhas(v.requisitos, c3 - 4, 'sans', 'normal', 9);
        const h = Math.max(lt.length, lr.length, 1) * lh(9) + 3.6;
        garantir(h);
        if (i % 2) { doc.setFillColor(BRAND.gray[50]); doc.rect(M, y, CW, h, 'F'); }
        mono(String(i + 1), M + 3, y + 1.9, { tam: 8, cor: '#c43a72' });
        if (lt.length) escrever(lt, M + c1 + 2, y + 1.8, { estilo: 'bold', tam: 9 });
        if (lr.length) escrever(lr, M + c1 + c2 + 2, y + 1.8, { tam: 9 });
        y += h;
      });
      doc.setDrawColor(BRAND.gray[200]); doc.line(M, y, M + CW, y);
      y += 7;
    }

    // Requisitos recorrentes + 3 prioridades lado a lado
    {
      const gap = 4; const cw = (CW - gap) / 2; const pad = 4.2;
      const rec = linhas(state.recorrentes, cw - 2 * pad, 'sans', 'normal', 9.5);
      const prios = state.prioridades.map((p) => linhas(p, cw - 2 * pad - 8, 'sans', 'bold', 10));
      const hRec = pad + lh(10.5) + 1.6 + (rec.length ? rec.length * lh(9.5) : 14.5) + pad;
      const hPri = pad + lh(10.5) + 2 + prios.reduce((s, l) => s + Math.max(1, l.length) * lh(10) + 2.5, 0) + pad - 1;
      const h = Math.max(hRec, hPri);
      garantir(h + 6);
      caixa(M, y, cw, h, { fill: '#ffffff', stroke: BRAND.gray[200], r: 2.5 });
      escrever('O que aparece repetidamente?', M + pad, y + pad, { estilo: 'bold', tam: 10.5 });
      if (rec.length) escrever(rec, M + pad, y + pad + lh(10.5) + 1.6, { tam: 9.5 });
      else linhasEmBranco(M + pad, y + pad + lh(10.5) - 1, cw - 2 * pad, 2);
      const x2 = M + cw + gap;
      caixa(x2, y, cw, h, { fill: BRAND.pinkSoft, stroke: BRAND.pink, lw: 0.4, r: 2.5 });
      escrever('Minhas 3 competências prioritárias', x2 + pad, y + pad, { estilo: 'bold', tam: 10.5 });
      let yy = y + pad + lh(10.5) + 2;
      prios.forEach((l, i) => {
        doc.setFillColor(BRAND.pink); doc.circle(x2 + pad + 2.6, yy + 2, 2.6, 'F');
        escrever(String(i + 1), x2 + pad + 2.6, yy + 0.75, { f: 'mono', estilo: 'bold', tam: 8, align: 'center' });
        if (l.length) escrever(l, x2 + pad + 8, yy + 0.2, { estilo: 'bold', tam: 10 });
        else { doc.setDrawColor(BRAND.gray[300]); doc.setLineWidth(0.25); doc.line(x2 + pad + 8, yy + 4, x2 + cw - pad, yy + 4); }
        yy += Math.max(1, l.length) * lh(10) + 2.5;
      });
      y += h + 7;
    }

    subtitulo('Meu gap em 4 dimensões');
    cartoes(GAPS.map((g) => ({ titulo: g.nome, prompt: g.pergunta, texto: state.gap[g.id] })), 2, { barra: BRAND.pink });
    dica('Antes de colocar “fazer um curso” no seu plano, olhe para 5 vagas do cargo que você quer e veja o que aparece repetidamente nos requisitos.', 'Dica prática', true);
  }

  /* ================= 30-60-90 ================= */
  const temCadeia = CADEIA.some((c) => state.cadeia[c.id].trim());
  const temFases = FASES.some((f) => state.fases[f.id].length);
  if (temCadeia || temFases) {
    tituloSecao('03', '30-60-90', 'Do gap à ação', 'Um plano pequeno que eu cumpro vale mais que um PDI gigantesco.');

    if (temCadeia) {
      subtitulo('Objetivo → Gap → Ação → Evidência → Prazo');
      const gw = 3.5; const cw = (CW - gw * 4) / 5;
      const cls = CADEIA.map((c) => linhas(state.cadeia[c.id], cw - 6, 'sans', 'normal', 8.5));
      const ch = 10 + Math.max(2, ...cls.map((l) => l.length)) * lh(8.5) + 3;
      garantir(ch + 6);
      CADEIA.forEach((c, i) => {
        const x = M + i * (cw + gw);
        caixa(x, y, cw, ch, { fill: i === 2 ? BRAND.dark : '#ffffff', stroke: i === 2 ? null : BRAND.gray[200], r: 2 });
        mono(c.nome, x + 3, y + 3.5, { cor: i === 2 ? BRAND.pink : '#c43a72', tam: 7 });
        if (cls[i].length) escrever(cls[i], x + 3, y + 8.5, { tam: 8.5, cor: i === 2 ? '#ffffff' : BRAND.black });
        if (i < 4) escrever('›', x + cw + 0.6, y + ch / 2 - 2.5, { estilo: 'bold', tam: 11, cor: BRAND.pink });
      });
      y += ch + 9;
    }

    if (temFases) {
      subtitulo('Meu plano 30-60-90');
      const gw = 5; const fw = (CW - 2 * gw) / 3;
      const cores = [BRAND.pink, '#e19e2c', '#bbcb30'];
      const listas = FASES.map((f) => state.fases[f.id].map((t) => linhas(t, fw - 12, 'sans', 'normal', 9.5)));
      const fh = 20 + Math.max(1, ...listas.map((l) => l.reduce((s, ls) => s + ls.length * lh(9.5) + 2.2, 0))) + 4;
      garantir(fh);
      FASES.forEach((f, i) => {
        const x = M + i * (fw + gw);
        caixa(x, y, fw, fh, { fill: '#ffffff', stroke: BRAND.gray[200], r: 2.5 });
        doc.setFillColor(cores[i]); doc.rect(x, y, fw, 2.2, 'F');
        mono(f.titulo, x + 4, y + 6, { cor: BRAND.gray[500], tam: 7 });
        escrever(f.foco, x + 4, y + 10, { estilo: 'bold', tam: 11 });
        let yy = y + 18;
        if (!listas[i].length) linhasEmBranco(x + 4, yy - 4, fw - 8, 2);
        listas[i].forEach((ls) => {
          doc.setFillColor(cores[i]); doc.circle(x + 5.5, yy + 1.6, 1, 'F');
          yy += escrever(ls, x + 9, yy, { tam: 9.5 }) + 2.2;
        });
      });
      y += fh + 6;
    }
    dica('Não transforme seu plano de carreira em uma lista infinita de cursos.', 'Lembrete');
  }

  /* ================= Matriz ================= */
  const itensMx = state.matriz.map((m, i) => ({ ...m, n: i + 1 })).filter((m) => m.acao.trim());
  if (itensMx.length) {
    tituloSecao('04', 'Matriz de prioridade', 'Impacto × Esforço', 'Qual ação tem maior impacto na minha carreira e menor esforço para começar?', 170);
    const mw = 84; const mh = 74; const mx0 = M + 7; const my0 = y;
    const fills = { agora: '#ffe1ec', planeje: '#fcefd9', avalie: BRAND.gray[100], depois: BRAND.gray[200] };
    [['agora', 0, 0], ['planeje', 1, 0], ['avalie', 0, 1], ['depois', 1, 1]].forEach(([k, qx, qy]) => {
      doc.setFillColor(fills[k]);
      doc.rect(mx0 + qx * mw / 2 + 0.4, my0 + qy * mh / 2 + 0.4, mw / 2 - 0.8, mh / 2 - 0.8, 'F');
      mono(QUADRANTES[k].titulo, mx0 + qx * mw / 2 + 3, my0 + qy * mh / 2 + 3, { tam: 6, cor: BRAND.gray[700], largura: mw / 2 - 6 });
    });
    mono('Esforço →', mx0 + mw / 2, my0 + mh + 2, { tam: 6.5, cor: BRAND.gray[500], align: 'center' });
    fonte('mono', 'bold', 6.5, BRAND.gray[500]);
    doc.text('IMPACTO →', M + 2.5, my0 + mh / 2, { angle: 90, align: 'center', baseline: 'middle', charSpace: 0.35 });

    const grupos = {};
    itensMx.forEach((m) => { const k = `${m.impacto}-${m.esforco}`; (grupos[k] = grupos[k] || []).push(m); });
    Object.values(grupos).forEach((g) => {
      // Ações com a mesma classificação ficam em grade dentro da célula.
      const cols = Math.ceil(Math.sqrt(g.length)); const rows = Math.ceil(g.length / cols);
      const sp = 5.4; const rr = g.length > 1 ? 2.3 : 2.6;
      g.forEach((m, j) => {
        const px = mx0 + ((m.esforco - 0.5) / 4) * mw + ((j % cols) - (cols - 1) / 2) * sp;
        const py = my0 + (1 - (m.impacto - 0.5) / 4) * mh + (Math.floor(j / cols) - (rows - 1) / 2) * sp;
        doc.setFillColor(BRAND.black); doc.setDrawColor('#ffffff'); doc.setLineWidth(0.4);
        doc.circle(px, py, rr, 'FD');
        escrever(String(m.n), px, py - 1.3, { f: 'mono', estilo: 'bold', tam: m.n > 9 ? 6 : 7, cor: '#ffffff', align: 'center' });
      });
    });

    // Legenda
    const lx = M + 98; const lw = CW - 98;
    let ly = y;
    itensMx.forEach((m) => {
      const ls = linhas(m.acao, lw - 9, 'sans', 'bold', 9.5);
      doc.setFillColor(BRAND.black); doc.circle(lx + 2.6, ly + 2.2, 2.4, 'F');
      escrever(String(m.n), lx + 2.6, ly + 0.85, { f: 'mono', estilo: 'bold', tam: 7, cor: '#ffffff', align: 'center' });
      ly += escrever(ls, lx + 7.5, ly, { estilo: 'bold', tam: 9.5 });
      ly += escrever(`Impacto ${NIVEIS[m.impacto - 1].toLowerCase()} · esforço ${NIVEIS[m.esforco - 1].toLowerCase()}`, lx + 7.5, ly, { tam: 7.5, cor: BRAND.gray[500] }) + 2.5;
    });
    y = Math.max(my0 + mh + 9, ly + 4);

    const quadrantes = Object.entries(QUADRANTES).map(([k, q]) => ({
      titulo: q.titulo, prompt: q.desc,
      texto: itensMx.filter((m) => quadrante(m) === k).map((m) => `${m.n}. ${m.acao.trim()}`).join('\n') || '—',
    }));
    subtitulo('Minhas prioridades', cartoes(quadrantes, 4, { escala: 0.9, barra: BRAND.pink, medir: true }));
    cartoes(quadrantes, 4, { barra: BRAND.pink, escala: 0.9 });
  }

  /* ================= Experimentos ================= */
  const exps = state.experimentos.filter((e) => e.area.trim() || e.acao.trim());
  if (exps.length) {
    tituloSecao('05', 'Experimentos de carreira', 'Você não precisa decidir. Você pode testar.', 'Depois de cada experimento, volte aqui e responda as perguntas.', 110);
    exps.forEach((e, i) => {
      const frase = linhas(descreverExperimento(e), CW - 12, 'sans', 'bold', 12);
      const h = 12 + frase.length * lh(12) + 6 + REFLEXAO.length * 8 + 16;
      garantir(h);
      caixa(M, y, CW, h, { fill: '#ffffff', stroke: BRAND.gray[200], r: 3 });
      doc.setFillColor(BRAND.butterfly[(i * 3) % BRAND.butterfly.length]); doc.rect(M, y + 3, 1.4, h - 6, 'F');
      let yy = y + 5;
      mono(`Experimento ${i + 1}${e.area.trim() ? ` · ${e.area.trim()}` : ''}`, M + 6, yy, { cor: '#c43a72' });
      yy += 5;
      yy += escrever(frase, M + 6, yy, { estilo: 'bold', tam: 12 }) + 5;
      mono('Depois do experimento', M + 6, yy, { cor: BRAND.gray[500], tam: 6.5 });
      ['Sim', 'Não', 'Talvez'].forEach((op, k) => mono(op, M + CW - 52 + k * 17 + 4, yy, { cor: BRAND.gray[500], tam: 6.5 }));
      yy += 5;
      REFLEXAO.forEach((q) => {
        escrever(q, M + 6, yy, { tam: 9.5 });
        [0, 1, 2].forEach((k) => { doc.setDrawColor(BRAND.pink); doc.setLineWidth(0.4); doc.roundedRect(M + CW - 52 + k * 17 + 4, yy - 0.2, 3.6, 3.6, 0.6, 0.6, 'S'); });
        yy += 8;
      });
      escrever('Anotações:', M + 6, yy, { tam: 8.5, cor: BRAND.gray[500] });
      doc.setDrawColor(BRAND.gray[200]); doc.setLineWidth(0.25); doc.line(M + 24, yy + 3.6, M + CW - 6, yy + 3.6);
      y += h + 6;
    });
  }

  /* ---- Fechamento ---- */
  garantir(22);
  y += 2;
  doc.addImage(imgs.borboleta, 'PNG', W / 2 - 6, y, 12, 12 * 266 / 300);
  y += 13;
  escrever('Você não precisa ter todas as respostas. Precisa saber qual é o próximo passo.', W / 2, y, { tam: 9, cor: BRAND.gray[600], align: 'center' });

  /* ---- Rodapés ---- */
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(BRAND.pink); doc.setLineWidth(0.4); doc.line(M, FOOTER_Y - 3, W - M, FOOTER_Y - 3);
    mono('WoMakersCode · Mentoria de carreira', M, FOOTER_Y, { cor: BRAND.gray[500], tam: 6.5 });
    mono('womakerscode.org', W / 2, FOOTER_Y, { cor: '#c43a72', tam: 6.5, align: 'center' });
    mono(`${p} / ${total}`, W - M, FOOTER_Y, { cor: BRAND.gray[500], tam: 6.5, align: 'right' });
  }

  doc.setProperties({
    title: `Meu Plano de Carreira${state.nome ? ` · ${limpar(state.nome)}` : ''}`,
    subject: 'Mentoria de carreira WoMakersCode',
    author: limpar(state.nome) || 'WoMakersCode',
    creator: 'WoMakersCode · Plano de carreira: da intenção à ação',
  });
  return doc;
}

export async function gerar(state) {
  const [{ jsPDF }, fontes, imgs] = await Promise.all([import('jspdf'), carregarFontes(), carregarImagens()]);
  return criar(state, fontes, imgs, jsPDF);
}

export async function baixarPdf(state) {
  const doc = await gerar(state);
  const nome = slug(state.nome);
  doc.save(`meu-plano-de-carreira${nome ? `-${nome}` : ''}.pdf`);
  return doc;
}
