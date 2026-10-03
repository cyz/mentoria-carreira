# Plano de carreira: da intenção à ação

App da mentoria de carreira WoMakersCode. As alunas fazem os exercícios da sessão e, no final, baixam um PDF
"Meu Plano de Carreira" com a identidade visual da [WoMakersCode](https://www.womakerscode.org).

## Etapas

1. **Radar de carreira** — interesse, competência, valores, contexto e mercado (com nota de clareza 1–5)
2. **Onde estou hoje** — o que já tenho / o que está faltando
3. **Career Gap** — 5 vagas → requisitos recorrentes → 3 competências prioritárias; gap em conhecimento, experiência, evidência e relacionamento
4. **30-60-90** — Objetivo → Gap → Ação → Evidência → Prazo, com até 3 ações por fase
5. **Matriz Impacto × Esforço**
6. **Experimentos de carreira** (bônus)
7. **Meu plano** — one-pager com os 9 campos + "Meu próximo passo", pré-preenchido com as respostas anteriores, e download do PDF

## Como funciona

- Next.js (App Router) com export estático (`output: 'export'`), publicado no GitHub Pages.
- As respostas ficam apenas no `localStorage` do navegador de cada aluna — nada é enviado a servidores.
- O PDF é gerado no navegador com [jsPDF](https://github.com/parallax/jsPDF), com as fontes Inter e IBM Plex Mono embutidas.

## Desenvolvimento

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # gera o site estático em out/
```

### Publicar no GitHub Pages

```bash
npm run deploy
```

O script `scripts/deploy.sh` gera o site com `NEXT_PUBLIC_BASE_PATH=/<repositório>` e publica a pasta `out/` no
branch `gh-pages`, que é a fonte do GitHub Pages.

## Créditos

Logo e cores: WoMakersCode. Fontes Inter e IBM Plex Mono: SIL Open Font License.
