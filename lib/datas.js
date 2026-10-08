/* Datas sempre no fuso local da aluna, no formato ISO curto "AAAA-MM-DD". */

const doisDigitos = (n) => String(n).padStart(2, '0');

/* Data local de hoje. Diferente de toISOString(), não vira o dia seguinte antes da meia-noite local. */
export function hojeLocal(agora = new Date()) {
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

export function lerData(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function somarDias(iso, dias) {
  const d = lerData(iso);
  if (!d) return '';
  d.setDate(d.getDate() + dias);
  return hojeLocal(d);
}

export function formatarData(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

export function formatarCurta(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}` : '';
}

export function formatarDataHora(ms) {
  if (!Number.isFinite(ms)) return '';
  const d = new Date(ms);
  return `${formatarData(hojeLocal(d))} ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

const NUMEROS = {
  um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8,
  nove: 9, dez: 10, quinze: 15, vinte: 20, trinta: 30, meio: 0.5, meia: 0.5,
};
export const SEMANAS_PADRAO = 2;
export const MAX_SEMANAS = 8;

const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const RE_DURACAO = /(\d+(?:[.,]\d+)?|[a-z]+)?\s*(dias?|semanas?|mes|meses)\b/;

/* Indica se a duração foi entendida (senão o diário usa SEMANAS_PADRAO). */
export const duracaoReconhecida = (duracao) => RE_DURACAO.test(normalizar(duracao));

/* Converte a duração livre de um experimento ("3 semanas", "1 mês", "15 dias") em semanas de diário. */
export function semanasDe(duracao) {
  const m = RE_DURACAO.exec(normalizar(duracao));
  if (!m) return SEMANAS_PADRAO;
  let n = 1;
  if (m[1]) n = /\d/.test(m[1]) ? Number(m[1].replace(',', '.')) : (NUMEROS[m[1]] ?? 1);
  const unidade = m[2];
  let semanas;
  if (unidade.startsWith('dia')) semanas = n / 7;
  else if (unidade.startsWith('semana')) semanas = n;
  else semanas = n * 4;
  return Math.min(MAX_SEMANAS, Math.max(1, Math.ceil(semanas)));
}

/* Semanas do diário de um experimento, a partir do início dele ou da data da mentoria. */
export function semanasDiario(experimento, dataBase) {
  const inicio = lerData(experimento?.inicio) ? experimento.inicio : (lerData(dataBase) ? dataBase : hojeLocal());
  return Array.from({ length: semanasDe(experimento?.duracao) }, (_, i) => ({
    n: i + 1,
    inicio: somarDias(inicio, i * 7),
    fim: somarDias(inicio, i * 7 + 6),
  }));
}
