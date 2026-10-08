/* Textos das etapas, compartilhados entre o formulário e o modo apresentação. */

export const FRASE = 'Você não precisa ter todas as respostas. Precisa saber qual é o próximo passo.';

export const ROADMAP = [
  ['Radar de carreira', 'O que eu quero?'],
  ['Onde estou hoje', 'O que eu já tenho e o que falta?'],
  ['Career Gap', '5 vagas → requisitos → 3 prioridades'],
  ['30-60-90', 'Transforme o gap em ação'],
  ['Impacto × Esforço', 'Não tente fazer tudo'],
  ['Experimentos', 'Você não precisa decidir. Pode testar.'],
  ['Meu plano', 'Seu one-pager em PDF ou Markdown'],
];

export const CONTEUDO = {
  inicio: {
    label: 'Início',
    kicker: 'Mentoria de carreira · WoMakersCode',
    dica: {
      titulo: 'Como funciona',
      texto: (
        <>
          Responda com frases curtas e honestas, sem precisar ter tudo definido agora. Seu progresso é salvo
          automaticamente neste navegador e, ao final, você pode baixar o plano em PDF ou em Markdown.
        </>
      ),
    },
  },
  radar: {
    label: 'Radar',
    num: '01',
    kicker: 'Ferramenta · Radar de carreira',
    titulo: 'Onde quero chegar?',
    lead: <>Reflita sobre cada dimensão e indique o quanto ela está <b>clara para você hoje</b> (1 = nada clara; 5 = muito clara).</>,
    dica: {
      titulo: 'Dica',
      texto: (
        <>
          Não escolha uma carreira considerando apenas o que você gosta. Busque a interseção entre{' '}
          <b>o que você gosta</b>, <b>o que você consegue desenvolver</b> e <b>onde existe uma oportunidade real</b>.
        </>
      ),
    },
  },
  hoje: {
    label: 'Onde estou',
    num: '02',
    kicker: 'Diagnóstico',
    titulo: 'Onde estou hoje?',
    lead: <>Observe seu momento atual sem julgamentos: todas as suas experiências fazem parte dessa trajetória.</>,
    dica: {
      titulo: 'Dica',
      texto: (
        <>
          Competências desenvolvidas em outras áreas podem ser transferíveis. Comunicação, organização, negociação e
          resolução de problemas, por exemplo, são relevantes em diferentes carreiras.
        </>
      ),
    },
  },
  gap: {
    label: 'Career Gap',
    num: '03',
    kicker: 'Ferramenta · Career Gap',
    titulo: 'Encontre seu Career Gap',
    lead: <>Compare seu momento atual com o objetivo profissional e identifique o que precisa ser desenvolvido.</>,
    dica: {
      titulo: 'Dica prática',
      texto: (
        <>
          Antes de incluir “fazer um curso” no plano, analise <b>5 vagas</b> relacionadas ao cargo desejado e identifique
          os requisitos mais recorrentes.
        </>
      ),
    },
  },
  acao: {
    label: '30-60-90',
    num: '04',
    kicker: 'Ferramenta · 30-60-90',
    titulo: 'Transforme o gap em ação',
    lead: <>Um plano objetivo e viável gera mais resultados do que um PDI extenso e difícil de executar.</>,
    dica: {
      titulo: 'Dica',
      texto: (
        <>
          <b>Evite transformar seu plano de carreira em uma lista extensa de cursos.</b> Em uma transição, experiências
          práticas e evidências concretas também são fundamentais.
        </>
      ),
    },
  },
  matriz: {
    label: 'Prioridades',
    num: '05',
    kicker: 'Ferramenta · Matriz de prioridade',
    titulo: 'Não tente fazer tudo',
    lead: <>Avalie quais ações podem gerar <b>maior impacto</b> na sua carreira com <b>menor esforço</b> inicial.</>,
    dica: {
      titulo: 'Para quem está sobrecarregada',
      texto: (
        <>
          Na matriz clássica de prioridades: <b>importante + urgente</b> → faça agora; <b>importante + não urgente</b> →
          planeje; <b>pouco importante + urgente</b> → avalie a necessidade; <b>pouco importante + não urgente</b> →
          deixe para outro momento.
        </>
      ),
    },
  },
  experimento: {
    label: 'Experimentos',
    num: '06',
    kicker: 'Bônus · Experimentos de carreira',
    titulo: 'Você não precisa decidir. Você pode testar.',
    lead: <>Um experimento é uma ação de curto prazo que ajuda a avaliar, na prática, se uma área combina com seus objetivos.</>,
    dica: {
      titulo: 'Dica',
      texto: <>Experimentar possibilidades é mais realista do que tentar encontrar uma única “profissão certa”.</>,
    },
  },
  plano: {
    label: 'Meu plano',
    num: '07',
    kicker: 'One-pager',
    titulo: 'Meu plano de carreira',
    lead: <>Revise as respostas reunidas nas etapas anteriores, faça os ajustes necessários e baixe o plano em PDF ou Markdown.</>,
  },
};
