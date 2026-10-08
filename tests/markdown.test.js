import { describe, expect, it } from 'vitest';
import { estadoInicial } from '@/lib/data';
import { gerarMarkdown } from '@/lib/markdown';

describe('gerarMarkdown', () => {
  it('gera o one-pager mesmo com o plano vazio', () => {
    const md = gerarMarkdown(estadoInicial({ data: '2026-10-08' }));
    expect(md).toContain('# Meu Plano de Carreira');
    expect(md).toContain('08/10/2026');
    expect(md).toContain('### 01 · Minha direção');
    expect(md).not.toContain('## 05 · Experimentos');
  });

  it('inclui tabelas escapadas, checklist e diário semanal', () => {
    const s = estadoInicial({ nome: 'Ana', data: '2026-10-08' });
    s.radar.interesse = { texto: 'dados | BI\nensinar', nota: 4 };
    s.fases.d30 = ['Estudar SQL'];
    s.experimentos = [{ area: 'UX', duracao: '3 semanas', inicio: '', acao: 'participar de uma comunidade' }];
    const md = gerarMarkdown(s);
    expect(md).toContain('| **Interesse** | O que eu gosto de fazer? | 4/5 | dados \\| BI<br>ensinar |');
    expect(md).toContain('| **Valores** | O que é importante para mim? | –/5 | – |');
    expect(md).toContain('- [ ] Estudar SQL');
    expect(md).toContain('##### Semana 1 · 08/10 a 14/10');
    expect(md).toContain('##### Semana 3 · 22/10 a 28/10');
    expect(md).not.toContain('Semana 4');
    expect(md).toContain('Gostei? ☐ Sim ☐ Não ☐ Talvez');
  });
});
