import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Suggestion, { SuggestionCategory, SuggestionType } from '#modules/suggestions/models/suggestion'

export default class extends BaseSeeder {
  async run() {
    const suggestions: Array<{
      title: string
      summary: string
      content: string
      category: SuggestionCategory
      type: SuggestionType
      estimatedReadTime: number
      imageUrl: string
      isActive: boolean
    }> = [
      // ===== ANXIETY & STRESS MANAGEMENT =====
      {
        title: 'Técnica de Grounding 5-4-3-2-1',
        summary: 'Use seus sentidos para se conectar ao momento presente e reduzir a ansiedade.',
        content: `A técnica 5-4-3-2-1 é uma ferramenta poderosa de grounding que ajuda a trazer sua mente de volta ao presente quando você está se sentindo ansioso, em pânico ou dissociado.

## Como funciona:

Esta técnica engaja todos os seus cinco sentidos para interromper pensamentos ansiosos e trazer sua atenção para o momento presente.

## Passo a passo:

### 5 coisas que você pode VER
Olhe ao redor e nomeie 5 coisas que você pode ver. Seja específico:
- "A caneta azul na mesa"
- "As folhas verdes da planta"
- "O relógio de parede branco"
- "A luz amarela do abajur"
- "O livro vermelho na estante"

### 4 coisas que você pode TOCAR
Preste atenção em 4 sensações táteis:
- "A textura macia do sofá"
- "O chão firme sob meus pés"
- "A temperatura fresca do ar"
- "A maciez da minha roupa"

### 3 coisas que você pode OUVIR
Escute atentamente e identifique 3 sons:
- "O som do ar condicionado"
- "Pássaros cantando lá fora"
- "O tique-taque do relógio"

### 2 coisas que você pode CHEIRAR
Se possível, identifique 2 aromas (ou cheiros que você gosta):
- "O cheiro do café"
- "O perfume fresco das flores"

### 1 coisa que você pode SABOREAR
Perceba 1 gosto na sua boca:
- "O gosto residual do almoço"
- "O frescor da água que bebi"

## Quando usar:

- Durante ataques de pânico
- Quando se sentir dissociado
- Em momentos de ansiedade intensa
- Antes de situações estressantes
- Quando sentir que está "fora do corpo"

## Benefícios:

✓ Interrompe espirais de pensamentos ansiosos
✓ Traz você de volta ao presente
✓ Reduz sintomas físicos de ansiedade
✓ Pode ser feito em qualquer lugar
✓ Não requer equipamento
✓ Funciona rapidamente (2-3 minutos)

## Dicas:

- Faça lentamente, sem pressa
- Seja específico nas descrições
- Se distrair, volte gentilmente
- Pratique em momentos calmos também
- Adapte conforme necessário (ex: 3-2-1 se estiver muito ansioso)

Esta técnica é especialmente útil porque é impossível estar totalmente presente nos seus sentidos e totalmente ansioso ao mesmo tempo.`,
        category: 'anxiety',
        type: 'exercise',
        estimatedReadTime: 4,
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        isActive: true
      },
      {
        title: 'Lidando com Pensamentos Intrusivos',
        summary: 'Estratégias práticas para gerenciar pensamentos indesejados e recorrentes.',
        content: `Pensamentos intrusivos são pensamentos indesejados, perturbadores ou angustiantes que surgem involuntariamente. É importante saber que ter esses pensamentos é normal e não define quem você é.

## O que são pensamentos intrusivos?

São pensamentos, imagens ou impulsos que aparecem na mente sem convite. Podem ser sobre:
- Medo de machucar alguém
- Preocupações catastróficas
- Dúvidas obsessivas
- Imagens perturbadoras
- Impulsos indesejados

## Princípio fundamental:

**Pensamentos não são fatos. Ter um pensamento não significa que você quer agir sobre ele ou que algo vai acontecer.**

## Estratégias eficazes:

### 1. Observe sem julgar
- Notice o pensamento: "Estou tendo o pensamento de que..."
- Não tente suprimir ou controlar
- Reconheça: "É apenas um pensamento"
- Deixe passar como uma nuvem no céu

### 2. Defusão Cognitiva
Crie distância entre você e o pensamento:

**Em vez de:** "Vou falhar"
**Diga:** "Estou tendo o pensamento de que vou falhar"

**Em vez de:** "Sou inadequado"
**Diga:** "Minha mente está contando a história de que sou inadequado"

### 3. Técnica do "Obrigado, Mente"
- Quando pensamento intrusivo aparecer
- Diga mentalmente: "Obrigado, mente, por tentar me proteger"
- Reconheça e siga em frente
- Sem engajamento ou luta

### 4. Rótulo Mental
- Identifique o padrão: "Ah, este é meu pensamento de 'e se'"
- Rotule: "Preocupação", "Catastrofização", "Autocrítica"
- Reconheça que já conhece esse padrão
- Escolha não seguir a trilha

### 5. Teste de Realidade
Questione o pensamento:
- Qual a evidência a favor/contra?
- Isso já aconteceu antes?
- Qual a probabilidade real?
- O que diria a um amigo?
- Isso importará daqui a 5 anos?

### 6. Técnica da Folha no Rio
- Imagine cada pensamento como folha flutuando no rio
- Observe a folha passar
- Não tente pará-la ou afundá-la
- Deixe o rio levar naturalmente

## O que NÃO fazer:

❌ **Suprimir:** Tentar não pensar só aumenta o pensamento
❌ **Engajar:** Analisar demais ou argumentar com o pensamento
❌ **Acreditar cegamente:** Aceitar como verdade absoluta
❌ **Agir impulsivamente:** Tomar decisões baseadas no medo
❌ **Isolar-se:** Guardar para si aumenta o poder do pensamento

## Quando buscar ajuda profissional:

- Pensamentos intrusivos dominam seu dia
- Interferem significativamente nas atividades
- Causam sofrimento intenso
- Levam a comportamentos compulsivos
- Estão relacionados a trauma

## Exercício prático:

**Diário de Pensamentos Intrusivos:**
1. **Pensamento:** O que passou pela cabeça?
2. **Situação:** O que estava acontecendo?
3. **Emoção:** Como se sentiu? (0-10)
4. **Resposta automática:** O que fez/quis fazer?
5. **Resposta alternativa:** Como poderia responder diferente?
6. **Resultado:** Como se sente agora? (0-10)

## Práticas de suporte:

- **Mindfulness diário:** Observar pensamentos regularmente
- **Exercício físico:** Reduz ansiedade geral
- **Sono adequado:** Mente cansada = mais pensamentos intrusivos
- **Redução de estresse:** Menos gatilhos
- **Conexão social:** Compartilhar reduz vergonha

## Afirmações úteis:

- "Pensamentos são apenas palavras/imagens mentais"
- "Não preciso acreditar em tudo que penso"
- "Posso ter esse pensamento e escolher não agir"
- "Isso é desconfortável, mas temporário"
- "Já passei por isso antes e passou"

Lembre-se: A presença de pensamentos intrusivos não indica problema de caráter ou perigo iminente. Com prática, você pode aprender a conviver com eles sem tanto sofrimento.`,
        category: 'anxiety',
        type: 'reflection',
        estimatedReadTime: 7,
        imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88',
        isActive: true
      },
      {
        title: 'Respiração Quadrada (Box Breathing)',
        summary: 'Técnica usada por militares para manter a calma em situações de alta pressão.',
        content: `A Respiração Quadrada, também conhecida como Box Breathing, é uma técnica poderosa usada por Navy SEALs, atletas de elite e profissionais de saúde mental para gerenciar estresse e manter o foco.

## O que é Box Breathing?

É uma técnica de respiração que divide o ciclo respiratório em quatro partes iguais, criando um "quadrado" ou "caixa" de respiração. Cada lado do quadrado representa uma fase de 4 segundos.

## Como praticar:

### Visualize um quadrado:

**Lado 1 (Base):** INSPIRE → 4 segundos
**Lado 2 (Direita):** SEGURE → 4 segundos  
**Lado 3 (Topo):** EXPIRE → 4 segundos
**Lado 4 (Esquerda):** SEGURE → 4 segundos

### Passo a passo detalhado:

1. **Posição:** Sente-se confortavelmente com coluna ereta
2. **Expire completamente:** Solte todo o ar dos pulmões
3. **Inspire (4s):** Conte lentamente até 4 enquanto inspira pelo nariz
4. **Segure (4s):** Retenha o ar contando até 4
5. **Expire (4s):** Solte o ar pela boca contando até 4
6. **Segure vazio (4s):** Mantenha pulmões vazios contando até 4
7. **Repita:** Continue por 4-5 minutos ou até sentir-se calmo

## Variações:

### Para iniciantes:
- Comece com 3 segundos cada lado
- Aumente gradualmente conforme confortável

### Para praticantes avançados:
- Aumente para 5-6 segundos
- Mantenha sempre o mesmo tempo em todos os lados

### Para ansiedade aguda:
- Foque mais na expiração longa
- 4-4-6-4 (expire por 6 segundos)

## Quando usar:

✓ Antes de apresentações ou reuniões importantes
✓ Durante crises de ansiedade
✓ Antes de dormir
✓ Durante o dia para reset mental
✓ Em momentos de raiva ou frustração
✓ Antes de tomar decisões importantes

## Benefícios científicos:

- **Ativa o sistema nervoso parassimpático:** Resposta de relaxamento
- **Reduz cortisol:** Hormônio do estresse
- **Melhora foco:** Oxigenação cerebral
- **Regula frequência cardíaca:** Variabilidade cardíaca saudável
- **Reduz pressão arterial:** Relaxamento vascular

## Por que funciona?

A respiração controlada envia sinais ao cérebro de que está tudo bem, interrompendo a resposta de "luta ou fuga". A simetria da técnica também ajuda a mente a focar, reduzindo pensamentos dispersos.

## Dicas para praticar:

1. **Ambiente:** Escolha local tranquilo inicialmente
2. **Postura:** Coluna ereta facilita respiração profunda
3. **Mãos:** Coloque uma mão no peito, outra na barriga
4. **Respiração:** Inspire profundamente pela barriga (diafragma)
5. **Gentileza:** Se perder a conta, recomece sem julgamento
6. **Consistência:** Pratique diariamente 5 minutos

## Aplicação prática:

**Manhã:** 5 minutos ao acordar para começar o dia centrado
**Trabalho:** Entre tarefas para reset mental
**Tarde:** Para combater o cansaço
**Noite:** Antes de dormir para relaxamento

## Exercício de visualização:

Enquanto respira, visualize:
- Um quadrado desenhando-se na sua mente
- Luz percorrendo os lados do quadrado
- Ondas do oceano seguindo o ritmo
- Uma caixa se abrindo e fechando

## Sinais de progresso:

- Frequência cardíaca mais baixa
- Sensação de calma
- Mente mais clara
- Respiração mais profunda naturalmente
- Menos tensão muscular

Esta técnica é especialmente poderosa porque você pode praticá-la discretamente em qualquer lugar - em reuniões, no trânsito, ou antes de situações desafiadoras.`,
        category: 'anxiety',
        type: 'meditation',
        estimatedReadTime: 5,
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
        isActive: true
      },
      {
        title: 'Ansiedade Social: Estratégias Práticas',
        summary: 'Técnicas para navegar situações sociais com mais conforto e confiança.',
        content: `A ansiedade social é mais do que timidez - é um medo intenso de situações sociais por receio de julgamento. Se você luta com isso, saiba que não está sozinho e existem estratégias eficazes.

## Compreendendo a ansiedade social:

### Sintomas comuns:
- Medo intenso de julgamento
- Preocupação excessiva antes de eventos
- Evitação de situações sociais
- Sintomas físicos (sudorese, tremor, náusea)
- Análise excessiva de interações após o evento
- Medo de embaraço ou humilhação

### O ciclo da ansiedade social:
1. **Antecipação:** Preocupação antes do evento
2. **Ativação:** Sintomas físicos de ansiedade
3. **Evitação/Resistência:** Impulso de fugir ou resistir
4. **Alívio temporário:** Sentir-se melhor ao evitar
5. **Reforço:** Ansiedade aumenta para próxima vez

## Estratégias antes do evento:

### 1. Preparação mental
- Identifique pensamentos catastróficos
- Desafie com evidências
- Prepare alguns tópicos de conversa
- Visualize sucesso em vez de fracasso

### 2. Autocuidado físico
- Durma bem na noite anterior
- Alimente-se adequadamente
- Evite cafeína em excesso
- Vista-se de forma confortável

### 3. Expectativas realistas
- Não precisa ser perfeito
- Pausas são normais em conversas
- Nem todos vão gostar de você (e está tudo bem)
- Foco em conexão, não performance

## Durante o evento:

### Técnicas de grounding:
1. **Pés no chão:** Sinta seus pés firmemente apoiados
2. **Objeto na mão:** Segure algo discretamente (chaveiro, caneta)
3. **Respiração 4-7-8:** Discretamente para acalmar
4. **5-4-3-2-1:** Use sentidos para presente

### Estratégias de conversa:

**Faça perguntas abertas:**
- "Como você conheceu...?"
- "O que você tem feito ultimamente?"
- "Qual sua opinião sobre...?"

**Escuta ativa:**
- Foque genuinamente na pessoa
- Faça perguntas de acompanhamento
- Mostre interesse real

**Compartilhe sobre você:**
- Não precisa ser profundo logo de cara
- Experiências comuns conectam
- Autenticidade > Impressionar

### Lidando com silêncios:
- Silêncios são normais
- Não são sua responsabilidade sozinho
- Use humor gentil: "Bom, isso foi um silêncio interessante!"
- Faça uma pergunta ou mude de assunto

## Após o evento:

### Evite ruminação excessiva:
Em vez de reanalisar cada momento:

**Faça:**
✓ Liste 3 coisas que foram bem
✓ Reconheça o esforço de participar
✓ Notice o que aprendeu
✓ Celebre pequenas vitórias

**Não faça:**
❌ Revisitar cada palavra dita
❌ Imaginar o pior sobre opiniões alheias
❌ Focar apenas em momentos "estranhos"
❌ Prometer nunca mais fazer isso

### Exercício de perspectiva:
Responda honestamente:
- Quantas vezes você já julgou alguém duramente?
- Por quanto tempo você pensa sobre pequenos erros dos outros?
- Alguém já mencionou algo que você temia?

Provavelmente: raramente, pouco tempo, nunca. Outros pensam em você muito menos do que imagina.

## Exposição gradual:

### Hierarquia de situações (do mais fácil ao mais difícil):

**Nível 1-2:** Situações de baixo risco
- Cumprimentar vizinho
- Pedir informação em loja
- Responder mensagem em grupo

**Nível 3-5:** Desafio moderado
- Café com um amigo próximo
- Participar de reunião pequena
- Iniciar conversa com colega

**Nível 6-8:** Desafio maior
- Pequeno evento social
- Jantar em grupo
- Apresentar algo breve

**Nível 9-10:** Maior desafio
- Grande evento social
- Apresentação para muitas pessoas
- Conhecer muitas pessoas novas

**Comece no nível 1-2 e progrida gradualmente.**

## Pensamentos úteis para desafiar:

### Pensamento ansioso → Pensamento alternativo

"Vou fazer papel de bobo"
→ "Todos cometem gafes às vezes. Não sou diferente"

"Ninguém quer falar comigo"
→ "Muitas pessoas também se sentem nervosas em eventos sociais"

"Vou travar e não saber o que dizer"
→ "Posso fazer perguntas e é ok ter silêncios"

"Todos estão me julgando"
→ "A maioria está focada em si mesma, como eu"

## Quando buscar ajuda profissional:

- Ansiedade social interfere significativamente na vida
- Evita escola, trabalho ou relacionamentos
- Sintomas físicos intensos
- Uso de substâncias para lidar
- Isolamento crescente

### Tratamentos eficazes:
- TCC (Terapia Cognitivo-Comportamental)
- Exposição gradual com terapeuta
- Treinamento de habilidades sociais
- Medicação quando indicado

## Dicas adicionais:

1. **Seja voluntário:** Ter uma função em evento reduz ansiedade
2. **Chegue cedo:** Mais fácil que entrar com todos lá
3. **Tenha rota de escape:** Mas tente não usar
4. **Limite álcool:** Não é muleta saudável
5. **Pratique autocompaixão:** Trate-se como trataria um amigo

Lembre-se: superar ansiedade social é processo gradual. Celebre cada pequeno passo, não espere perfeição. Você merece conexões significativas e é capaz de construí-las.`,
        category: 'anxiety',
        type: 'exercise',
        estimatedReadTime: 9,
        imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
        isActive: true
      }
    ]

    // Insert suggestions one by one to avoid conflicts
    for (const suggestion of suggestions) {
      await Suggestion.create(suggestion)
    }

    console.log('✅ New suggestions seeded successfully!')
  }
}
