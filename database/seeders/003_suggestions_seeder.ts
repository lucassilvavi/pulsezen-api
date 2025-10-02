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
      {
        title: 'Técnica de Respiração 4-7-8',
        summary: 'Uma técnica simples e eficaz para reduzir a ansiedade e promover o relaxamento.',
        content: `A técnica de respiração 4-7-8 é uma ferramenta poderosa para acalmar o sistema nervoso e reduzir a ansiedade. Desenvolvida pelo Dr. Andrew Weil, esta técnica é baseada na antiga prática de pranayama do yoga.

## Como praticar:

1. **Posicione-se confortavelmente**: Sente-se com as costas eretas ou deite-se em uma superfície plana.

2. **Expire completamente**: Solte todo o ar dos pulmões pela boca, fazendo um som de "whoosh".

3. **Inale pelo nariz (4 segundos)**: Feche a boca e inale silenciosamente pelo nariz contando até 4.

4. **Segure a respiração (7 segundos)**: Mantenha o ar nos pulmões contando até 7.

5. **Expire pela boca (8 segundos)**: Abra a boca e expire fazendo o som de "whoosh" contando até 8.

6. **Repita o ciclo**: Faça isso 4 vezes inicialmente, podendo aumentar gradualmente.

## Benefícios:
- Reduz a ansiedade instantaneamente
- Melhora o foco e concentração
- Ajuda a adormecer mais rapidamente
- Diminui a pressão arterial
- Fortalece o sistema imunológico

## Dicas importantes:
- Pratique com o estômago vazio
- Não se preocupe em ser exato com o tempo
- Se sentir tontura, pare e respire normalmente
- A prática regular torna a técnica mais eficaz

Esta técnica pode ser praticada em qualquer lugar e momento, sendo especialmente útil antes de situações estressantes ou quando você precisa se acalmar rapidamente.`,
        category: 'anxiety',
        type: 'meditation',
        estimatedReadTime: 3,
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        isActive: true
      },
      {
        title: 'Gratidão: O Poder de Reconhecer o Bom',
        summary: 'Descubra como a prática da gratidão pode transformar sua perspectiva e bem-estar.',
        content: `A gratidão é uma das práticas mais simples e poderosas para melhorar o bem-estar mental e emocional. Estudos científicos mostram que cultivar a gratidão regularmente pode reduzir a depressão, aumentar a felicidade e melhorar a qualidade do sono.

## O que é gratidão?

A gratidão é o reconhecimento consciente das coisas boas em nossas vidas. Não se trata apenas de pensar positivo, mas de verdadeiramente apreciar e valorizar o que temos.

## Exercícios práticos:

### 1. Diário de Gratidão
- Escreva 3 coisas pelas quais você é grato todos os dias
- Seja específico: ao invés de "família", escreva "a risada do meu filho hoje"
- Varie entre coisas grandes e pequenas

### 2. Gratidão no Presente
- Pause durante o dia e identifique algo pelo qual você é grato neste momento
- Pode ser algo simples como o sabor do café ou a luz do sol

### 3. Cartas de Gratidão
- Escreva uma carta para alguém importante expressando sua gratidão
- Você pode entregá-la ou guardar para si

### 4. Meditação da Gratidão
- Dedique 5 minutos para focar em sentimentos de gratidão
- Visualize pessoas e situações pelas quais você é grato

## Benefícios científicos:
- Melhora do humor em até 25%
- Redução dos sintomas de depressão
- Melhora na qualidade do sono
- Fortalecimento do sistema imunológico
- Maior satisfação com relacionamentos
- Aumento da autoestima

## Dicas para manter o hábito:
- Comece pequeno: apenas 2-3 minutos por dia
- Seja consistente: escolha um horário fixo
- Seja específico e pessoal
- Inclua desafios superados
- Compartilhe sua gratidão com outros

Lembre-se: a gratidão não é sobre ignorar problemas, mas sobre reconhecer que mesmo em tempos difíceis, existem aspectos positivos em nossas vidas.`,
        category: 'mindfulness',
        type: 'reflection',
        estimatedReadTime: 5,
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
        isActive: true
      },
      {
        title: 'Mindfulness no Cotidiano',
        summary: 'Aprenda a incorporar a atenção plena em atividades simples do dia a dia.',
        content: `Mindfulness não precisa ser praticado apenas em meditação formal. Você pode incorporar a atenção plena em atividades cotidianas, transformando momentos ordinários em oportunidades de presença e consciência.

## O que é Mindfulness Cotidiano?

É a prática de estar completamente presente e engajado no que você está fazendo, sem julgamento e com curiosidade gentil.

## Práticas para o dia a dia:

### 1. Mindful Eating (Alimentação Consciente)
- Coma sem distrações (TV, celular)
- Observe cores, texturas e aromas
- Mastigue lentamente
- Notice as sensações de fome e saciedade

### 2. Mindful Walking (Caminhada Consciente)
- Preste atenção aos seus pés tocando o chão
- Observe o movimento do seu corpo
- Notice sons, cheiros e visões ao redor
- Sinta a temperatura e o vento na pele

### 3. Mindful Breathing nos Transportes
- Use o tempo no trânsito para focar na respiração
- Conte respirações ou observe o ritmo natural
- Deixe pensamentos passarem como nuvens

### 4. Mindful Listening (Escuta Consciente)
- Quando alguém estiver falando, escute realmente
- Evite planejar sua resposta
- Notice o tom, ritmo e emoções
- Pratique empatia e presença

### 5. Mindful Cleaning (Limpeza Consciente)
- Trate atividades domésticas como meditação
- Sinta a água morna nas mãos
- Observe movimentos repetitivos
- Transforme tarefas em momentos de paz

## Técnicas rápidas (1-2 minutos):

### STOP Technique:
- **S**top (pare o que está fazendo)
- **T**ake a breath (respire conscientemente)
- **O**bserve (notice pensamentos e sensações)
- **P**roceed (continue com consciência)

### 5-4-3-2-1 Grounding:
- 5 coisas que você pode ver
- 4 coisas que você pode tocar
- 3 coisas que você pode ouvir
- 2 coisas que você pode cheirar
- 1 coisa que você pode saborear

## Benefícios:
- Redução do estresse e ansiedade
- Melhora da concentração
- Maior satisfação com atividades simples
- Redução da mente acelerada
- Melhores relacionamentos
- Sono mais reparador

## Dicas para começar:
- Escolha uma atividade por semana para praticar mindfulness
- Use lembretes no celular
- Seja paciente consigo mesmo
- Notice sem julgar quando a mente divagar
- Comece com 1-2 minutos por dia

O objetivo não é esvaziar a mente, mas estar presente com o que quer que esteja acontecendo. Cada momento é uma nova oportunidade de praticar.`,
        category: 'mindfulness',
        type: 'exercise',
        estimatedReadTime: 6,
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
        isActive: true
      },
      {
        title: 'Autocuidado sem Culpa',
        summary: 'Descubra como praticar o autocuidado de forma saudável e sem sentimentos de culpa.',
        content: `O autocuidado não é luxo, é necessidade. Muitas vezes sentimos culpa ao reservar tempo para nós mesmos, mas cuidar de si é fundamental para ter energia e capacidade de cuidar dos outros e das responsabilidades da vida.

## O que é autocuidado?

Autocuidado são ações intencionais que você toma para cuidar da sua saúde física, mental e emocional. Não se trata de egoísmo, mas de responsabilidade pessoal.

## Desmistificando o autocuidado:

### Não precisa ser caro:
- Banho relaxante com música
- Caminhada no parque
- Leitura de um livro
- Conversa com um amigo querido
- 10 minutos de meditação

### Não precisa durar horas:
- 5 minutos de respiração profunda
- Alongamento de 2 minutos
- Escrever uma frase de gratidão
- Beber um chá mindfully

## Dimensões do autocuidado:

### 1. Físico
- Sono adequado (7-9 horas)
- Alimentação nutritiva
- Exercício regular
- Higiene pessoal
- Consultas médicas preventivas

### 2. Emocional
- Reconhecer e validar sentimentos
- Estabelecer limites saudáveis
- Pedir ajuda quando necessário
- Praticar autocompaixão
- Expressar emoções de forma saudável

### 3. Mental
- Ler ou aprender algo novo
- Resolver quebra-cabeças
- Praticar mindfulness
- Limitar consumo de notícias negativas
- Organizar pensamentos através da escrita

### 4. Social
- Conectar-se com pessoas queridas
- Estabelecer e manter relacionamentos saudáveis
- Dizer não quando necessário
- Buscar apoio em comunidades
- Praticar comunicação assertiva

### 5. Espiritual
- Meditação ou oração
- Tempo na natureza
- Reflexão sobre valores e propósito
- Práticas de gratidão
- Atividades que trazem significado

## Lidando com a culpa:

### Lembre-se:
- Você não pode dar o que não tem
- Cuidar de si mesmo é um exemplo positivo
- Autocuidado melhora sua capacidade de ajudar outros
- Você merece cuidado tanto quanto qualquer pessoa

### Questões para reflexão:
- "Se meu melhor amigo estivesse esgotado, eu incentivaria o autocuidado?"
- "Como posso cuidar dos outros se estou exausto?"
- "Que tipo de exemplo quero dar sobre autovalorização?"

## Criando uma rotina sustentável:

### Comece pequeno:
- 5 minutos por dia
- Uma atividade que você já gosta
- Horário específico (manhã, almoço, antes de dormir)

### Exemplos de rotinas rápidas:

**Manhã (5 min):**
- 2 min de alongamento
- 3 min escrevendo intenções do dia

**Almoço (10 min):**
- Comer sem celular
- Caminhada curta
- Respiração consciente

**Noite (15 min):**
- Banho relaxante
- Leitura
- Diário de gratidão
- Meditação guiada

## Sinais de que você precisa de mais autocuidado:
- Irritabilidade constante
- Fadiga excessiva
- Dificuldade para dormir
- Sentimentos de overwhelm
- Doenças frequentes
- Perda de interesse em atividades prazerosas

Lembre-se: autocuidado não é uma recompensa por trabalho duro, é um investimento na sua capacidade de viver bem e contribuir positivamente para o mundo ao seu redor.`,
        category: 'self-care',
        type: 'reflection',
        estimatedReadTime: 7,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        isActive: true
      },
      {
        title: 'Estabelecendo Limites Saudáveis',
        summary: 'Aprenda a estabelecer e manter limites que protegem seu bem-estar emocional.',
        content: `Estabelecer limites saudáveis é uma habilidade essencial para manter relacionamentos equilibrados e proteger seu bem-estar mental. Limites não são muros para excluir pessoas, mas diretrizes claras sobre como você quer ser tratado.

## O que são limites?

Limites são regras pessoais que você estabelece sobre como outras pessoas podem se comportar ao seu redor e como você vai reagir quando esses limites forem ultrapassados.

## Tipos de limites:

### 1. Limites Físicos
- Espaço pessoal e toque
- Privacidade em casa
- Tempo de descanso
- Limites relacionados a saúde

**Exemplos:**
- "Preciso de 30 minutos sozinho quando chego do trabalho"
- "Não me sinto confortável com abraços, prefiro cumprimentos"

### 2. Limites Emocionais
- Não aceitar abuso verbal
- Não ser responsável pelos sentimentos dos outros
- Proteger-se de manipulação emocional

**Exemplos:**
- "Não vou discutir quando você está gritando"
- "Não posso resolver seus problemas por você"

### 3. Limites de Tempo
- Horários para trabalho e descanso
- Disponibilidade para ajudar outros
- Tempo para autocuidado

**Exemplos:**
- "Não respondo mensagens de trabalho após 18h"
- "Preciso avisar com antecedência para compromissos"

### 4. Limites Digitais
- Tempo de tela
- Redes sociais
- Disponibilidade online

**Exemplos:**
- "Não uso celular durante as refeições"
- "Tenho um dia por semana offline"

## Como estabelecer limites:

### 1. Identifique suas necessidades
- O que você precisa para se sentir seguro e respeitado?
- Que comportamentos o incomodam?
- Que situações drenam sua energia?

### 2. Seja claro e direto
- Use "eu" ao invés de "você"
- Seja específico sobre o que precisa
- Evite justificativas excessivas

**Em vez de:** "Você sempre me interrompe e isso é irritante"
**Diga:** "Eu preciso terminar de falar antes de ouvir sua opinião"

### 3. Seja consistente
- Mantenha os mesmos limites com as mesmas pessoas
- Não mude regras baseado no humor
- Aplique consequências quando necessário

### 4. Comunique com compaixão
- Seja firme mas gentil
- Explique que é sobre suas necessidades, não sobre rejeição
- Reconheça que mudanças levam tempo

## Frases úteis para estabelecer limites:

### Para pedidos excessivos:
- "Não posso me comprometer com isso agora"
- "Preciso verificar minha agenda e te retorno"
- "Isso não é prioridade para mim no momento"

### Para comportamentos inadequados:
- "Quando você fala assim, me sinto desrespeitado"
- "Prefiro conversar quando ambos estivermos calmos"
- "Esse tom de voz não é aceitável para mim"

### Para preservar tempo:
- "Tenho outros compromissos"
- "Esse horário não funciona para mim"
- "Preciso de uma pausa antes de decidir"

## Lidando com resistência:

### Reações comuns quando você estabelece limites:
- Culpa ("Você não se importa comigo")
- Raiva ("Você está sendo egoísta")
- Manipulação ("Se você me amasse, faria isso")
- Teste dos limites (ignorar o que você disse)

### Como responder:
- Mantenha-se firme
- Não se justifique excessivamente
- Repita o limite calmamente
- Aplique consequências se necessário

## Sinais de limites saudáveis:

✅ Você se sente respeitado nos relacionamentos
✅ Tem energia para suas prioridades
✅ Consegue dizer não sem culpa excessiva
✅ Sente-se autêntico nas interações
✅ Tem tempo para autocuidado
✅ Relacionamentos são equilibrados

## Sinais de limites fracos:

❌ Resentimento frequente
❌ Sensação de ser aproveitado
❌ Exaustão emocional constante
❌ Dificuldade em dizer não
❌ Ansiedade sobre decepcionar outros
❌ Perda de identidade própria

## Exercício prático:

1. **Identifique uma situação** onde você se sente desconfortável regularmente
2. **Determine que limite** seria útil
3. **Pratique a frase** que usaria para comunicar esse limite
4. **Escolha uma consequência** se o limite for desrespeitado
5. **Implemente gradualmente** começando com situações menos desafiadoras

Lembre-se: estabelecer limites é um ato de autorrespeito e autoamor. Pessoas que realmente se importam com você vão respeitar seus limites, mesmo que inicialmente não compreendam.`,
        category: 'relationships',
        type: 'reflection',
        estimatedReadTime: 8,
        imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
        isActive: true
      },
      {
        title: 'Produtividade com Bem-estar',
        summary: 'Descubra como ser produtivo sem sacrificar sua saúde mental e física.',
        content: `Produtividade real não é sobre fazer mais coisas, mas sobre fazer as coisas certas de forma sustentável, mantendo seu bem-estar como prioridade.

## Repensando a produtividade:

### Produtividade tóxica vs. Produtividade saudável:

**Tóxica:**
- Trabalhar sem parar
- Culpa ao descansar
- Quantidade sobre qualidade
- Ignorar necessidades básicas
- Comparação constante com outros

**Saudável:**
- Trabalho focado com pausas
- Descanso como necessidade
- Qualidade e impacto
- Autocuidado como base
- Progresso pessoal

## Princípios da produtividade saudável:

### 1. Energy Management (Gestão de Energia)
Gerencie sua energia, não apenas seu tempo.

**Identifique seus picos de energia:**
- Manhã: tarefas complexas
- Tarde: reuniões e comunicação
- Noite: tarefas administrativas simples

**Proteja sua energia:**
- 7-9 horas de sono
- Refeições regulares e nutritivas
- Exercícios regulares
- Pausas entre tarefas

### 2. Foco vs. Multitasking
Multitasking reduz eficiência em até 40%.

**Práticas de foco:**
- Técnica Pomodoro (25 min foco + 5 min pausa)
- Blocos de tempo para tarefas similares
- Ambiente livre de distrações
- Uma tarefa por vez

### 3. A regra 80/20 (Princípio de Pareto)
80% dos resultados vêm de 20% das ações.

**Como aplicar:**
- Identifique as 3 tarefas mais importantes do dia
- Foque no que gera maior impacto
- Elimine ou delegue tarefas de baixo valor
- Revise prioridades semanalmente

## Técnicas práticas:

### Time Blocking
- Bloqueie tempo no calendário para tarefas específicas
- Inclua tempo para pausas e imprevistos
- Respeite os blocos como compromissos reais

### Getting Things Done (GTD)
1. **Capture:** Anote todas as tarefas
2. **Clarify:** Defina ações específicas
3. **Organize:** Categorize por contexto
4. **Reflect:** Revise semanalmente
5. **Engage:** Execute com confiança

### Método PARA (Projects, Areas, Resources, Archive)
- **Projects:** Objetivos com prazo
- **Areas:** Responsabilidades contínuas
- **Resources:** Materiais de referência
- **Archive:** Itens inativos

## Pausas estratégicas:

### Micro-pausas (2-5 minutos):
- Respiração profunda
- Alongamento no local
- Olhar para longe da tela
- Hidratação

### Pausas ativas (15-30 minutos):
- Caminhada
- Exercício leve
- Meditação
- Lanche saudável

### Pausas longas (1+ hora):
- Exercício completo
- Hobby ou atividade prazerosa
- Socialização
- Descanso completo

## Estabelecendo limites produtivos:

### No trabalho:
- Horário fixo de início e fim
- Pausa para almoço obrigatória
- Não levar trabalho para casa
- Comunicar disponibilidade claramente

### Com tecnologia:
- Notificações apenas para urgências
- Período sem dispositivos
- Apps de produtividade com moderação
- Redes sociais em horários específicos

## Sinais de desequilíbrio:

### Quando parar e reavaliar:
❌ Exaustão constante
❌ Qualidade do trabalho diminuindo
❌ Relacionamentos sendo negligenciados
❌ Problemas de saúde
❌ Perda de prazer em atividades
❌ Ansiedade sobre produtividade

## Estratégias para dias difíceis:

### Quando a motivação está baixa:
1. **Tarefas menores:** Divida grandes projetos
2. **Regra dos 2 minutos:** Se leva menos de 2 min, faça agora
3. **Progresso mínimo:** 15 minutos é melhor que zero
4. **Recompensas:** Celebre pequenos avanços
5. **Autocompaixão:** Dias ruins são normais

### Quando há sobrecarga:
1. **Brain dump:** Anote tudo que está na mente
2. **Priorize ruthlessly:** O que realmente importa hoje?
3. **Delegue:** O que outros podem fazer?
4. **Elimine:** O que pode esperar ou ser cancelado?
5. **Peça ajuda:** Não hesite em buscar suporte

## Rotina de bem-estar produtivo:

### Manhã:
- Despertar sem pressa
- Hidratação
- Movimento (alongamento/exercício)
- Intenção para o dia
- Tarefa mais importante primeiro

### Durante o dia:
- Pausas regulares
- Alimentação consciente
- Hidratação constante
- Respiração entre tarefas
- Celebração de pequenos progressos

### Noite:
- Revisão do dia com gentileza
- Desconexão de trabalho/telas
- Atividade relaxante
- Preparação para sono de qualidade

## Métricas de sucesso saudáveis:

Em vez de apenas "quantas tarefas completei", considere:
- Como me senti durante o dia?
- Mantive energia ao longo do dia?
- Tive tempo para relacionamentos importantes?
- Consegui descansar adequadamente?
- Fiz progresso no que realmente importa?

Lembre-se: produtividade sustentável é uma maratona, não uma corrida de velocidade. O objetivo é manter consistência e bem-estar a longo prazo, não queimar energia rapidamente.`,
        category: 'productivity',
        type: 'exercise',
        estimatedReadTime: 9,
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b',
        isActive: true
      }
    ]

    // Insert suggestions one by one to avoid conflicts
    for (const suggestion of suggestions) {
      await Suggestion.create(suggestion)
    }

    console.log('✅ Suggestions seeded successfully!')
  }
}