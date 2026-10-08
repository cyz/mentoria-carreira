import { describe, expect, it } from 'vitest';
import { jsPDF } from 'jspdf';
import { estadoInicial } from '@/lib/data';
import { criar } from '@/lib/pdf';

// PNG 1×1 transparente.
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const imgs = { logo: PNG, borboleta: PNG };

/* Guarda todo texto desenhado, já que o PDF sai comprimido. */
function gerar(state) {
  const textos = [];
  class Espiao extends jsPDF {
    constructor(...args) {
      super(...args);
      const original = this.text.bind(this);
      this.text = (t, ...resto) => {
        textos.push(...[].concat(t));
        return original(t, ...resto);
      };
    }
  }
  const doc = criar(state, false, imgs, Espiao);
  return { doc, texto: textos.join('\n') };
}

describe('PDF', () => {
  it('gera o one-pager com o plano vazio', () => {
    const { doc, texto } = gerar(estadoInicial());
    expect(doc.getNumberOfPages()).toBeLessThanOrEqual(2);
    expect(texto).toContain('Meu Plano de Carreira');
    expect(texto).not.toContain('DIÁRIO DOS EXPERIMENTOS');
  });

  it('mostra notas não avaliadas do radar como "–/5"', () => {
    const s = estadoInicial();
    s.radar.interesse = { texto: 'dados', nota: 4 };
    const { texto } = gerar(s);
    expect(texto).toContain('4/5');
    expect(texto).toMatch(/^-\/5$/m); // sem as fontes Unicode, o traço vira hífen
  });

  it('inclui o diário semanal dos experimentos', () => {
    const s = estadoInicial({ nome: 'Ana', data: '2026-10-08' });
    s.experimentos = [
      { area: 'UX', duracao: '1 mês', inicio: '', acao: 'participar de uma comunidade' },
      { area: 'Dados', duracao: '2 semanas', inicio: '2026-11-10', acao: 'fazer um projeto' },
    ];
    const { doc, texto } = gerar(s);
    expect(texto).toContain('DIÁRIO DOS EXPERIMENTOS');
    expect(texto).toContain('SEMANA 4 · 29/10 A 04/11');
    expect(texto).toContain('SEMANA 2 · 17/11 A 23/11');
    expect(texto).not.toContain('SEMANA 5');
    expect(texto).toContain('O que fiz nesta semana?');
    expect(doc.getNumberOfPages()).toBeGreaterThan(2);
  });
});
