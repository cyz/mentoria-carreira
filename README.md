# Plano de carreira: da intenção à ação

App da mentoria de carreira WoMakersCode. As alunas fazem os exercícios da sessão e, no final, baixam um PDF
"Meu Plano de Carreira" com a identidade visual da [WoMakersCode](https://www.womakerscode.org).

## Etapas

1. **Radar de carreira** — interesse, competência, valores, contexto e mercado (com nota de clareza 1–5)
2. **Onde estou hoje** — o que já tenho / o que está faltando
3. **Career Gap** — 5 vagas → requisitos recorrentes → 3 competências prioritárias; gap em conhecimento, experiência, evidência e relacionamento
4. **30-60-90** — Objetivo → Gap → Ação → Evidência → Prazo, com até 3 ações por fase
5. **Matriz Impacto × Esforço**
6. **Experimentos de carreira** (bônus) — com diário semanal datado no material final
7. **Meu plano** — one-pager com os 9 campos + "Meu próximo passo", pré-preenchido com as respostas anteriores
   (avisando quando uma resposta de origem muda), e download em PDF ou Markdown

## Recursos

- **Vários planos** no mesmo navegador (criar, duplicar, renomear, excluir com "desfazer").
- **Backup em arquivo `.json`** para levar os planos a outro navegador ou computador (exportar/importar em "Meus planos").
- **Exportação em Markdown** (download ou cópia), pronta para o Notion ou um repositório no GitHub.
- **Diário semanal dos experimentos** no PDF e no Markdown, com as datas de cada semana calculadas a partir da duração.
- **Modo apresentação** (botão "Apresentar"): as etapas em tela cheia, sem campos nem respostas, para projetar na
  mentoria. Navegação com ← →, Home/End, `F` (tela cheia) e Esc (sair).
- Progresso real por etapa no stepper e sincronização entre abas abertas do mesmo navegador.

## Como funciona

- Next.js (App Router) com export estático (`output: 'export'`), publicado no GitHub Pages.
- As respostas ficam apenas no `localStorage` do navegador de cada aluna — nada é enviado a servidores.
  Cada plano é salvo em `wmc-carreira-v2:plano:<id>` e o índice em `wmc-carreira-v2`; dados do formato antigo
  (`wmc-plano-carreira-v1`) são migrados automaticamente.
- O PDF é gerado no navegador com [jsPDF](https://github.com/parallax/jsPDF), com as fontes Inter e IBM Plex Mono embutidas.

## Estrutura

- `lib/data.js` — conteúdo da mentoria e estado inicial; `lib/state.js` — migração/saneamento e sugestões do one-pager
- `lib/armazenamento.js` — `localStorage`, vários planos e backup; `lib/progresso.js` — progresso por etapa
- `lib/datas.js` — datas locais e semanas do diário; `lib/pdf.js` e `lib/markdown.js` — exportações
- `components/` — telas (`steps.jsx`), diálogo de planos, modo apresentação e textos compartilhados (`conteudo.jsx`)

## Desenvolvimento

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # gera o site estático em out/
npm test        # testes (Vitest)
npm run lint    # ESLint
```

### Publicar no GitHub Pages

O deploy é feito pelo GitHub Actions (`.github/workflows/deploy.yml`) a cada push na `main`, ou manualmente em
**Actions → Deploy no GitHub Pages → Run workflow**. Lint e testes rodam antes do build; se falharem, o deploy não acontece. O workflow define `NEXT_PUBLIC_BASE_PATH` com o caminho do
repositório no Pages e publica a pasta `out/`.

## Créditos

Logo e cores: WoMakersCode. Fontes Inter e IBM Plex Mono: SIL Open Font License.
