import { BaseCommand } from '@adonisjs/core/ace'
import db from '@adonisjs/lucid/services/db'
import Suggestion from '../app/modules/suggestions/models/suggestion.js'

const suggestions = [
  // Mindfulness
  {
    title: 'Técnica de Respiração 4-7-8',
    summary: 'Uma técnica simples e eficaz para reduzir a ansiedade e promover o relaxamento.',
    content: `# Técnica de Respiração 4-7-8

Esta é uma das técnicas de respiração mais eficazes para reduzir a ansiedade e promover o relaxamento profundo.

## Como fazer:

1. **Posição**: Sente-se confortavelmente com as costas retas ou deite-se
2. **Expiração**: Expire completamente pela boca, fazendo um som de "whoosh"
3. **Inspiração**: Feche a boca e inspire pelo nariz contando até 4
4. **Retenção**: Segure a respiração contando até 7
5. **Expiração**: Expire pela boca contando até 8, fazendo o som "whoosh"

## Benefícios:
- Reduz ansiedade e estresse
- Melhora a qualidade do sono
- Diminui a pressão arterial
- Promove relaxamento profundo

**Pratique 4 ciclos, 2 vezes ao dia.**`,
    category: 'mindfulness' as const,
    type: 'meditation' as const,
    estimatedReadTime: 3,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  },
  {
    title: 'Meditação Mindfulness de 5 Minutos',
    summary: 'Uma meditação guiada rápida para aumentar a consciência do momento presente.',
    content: `# Meditação Mindfulness de 5 Minutos

## Preparação:
- Encontre um local silencioso
- Sente-se confortavelmente
- Feche os olhos ou mantenha um olhar suave

## Prática:

**Minutos 1-2: Respiração**
- Foque na sua respiração natural
- Conte: inspiração (1), expiração (2), até 10
- Recomeçe do 1 se a mente divagar

**Minutos 3-4: Sensações corporais**
- Escaneie seu corpo da cabeça aos pés
- Note tensões sem julgamento
- Relaxe conscientemente cada parte

**Minuto 5: Integração**
- Volte a atenção para a respiração
- Estabeleça uma intenção para o dia
- Abra os olhos lentamente

## Dica:
Use essa técnica sempre que se sentir sobrecarregado(a).`,
    category: 'mindfulness' as const,
    type: 'meditation' as const,
    estimatedReadTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400'
  },

  // Exercícios para ansiedade
  {
    title: 'Exercícios de Alongamento para Ansiedade',
    summary: 'Movimentos simples que liberam tensão física e reduzem o estresse.',
    content: `# Exercícios de Alongamento para Ansiedade

A tensão física está diretamente ligada ao estresse mental. Estes alongamentos ajudam a quebrar esse ciclo.

## Sequência (5-10 minutos):

### 1. Alongamento do Pescoço
- Incline a cabeça para o lado direito (30 seg)
- Repita para o lado esquerdo
- Olhe para cima e para baixo lentamente

### 2. Rotação dos Ombros
- 10 rotações para frente
- 10 rotações para trás
- Eleve os ombros e solte

### 3. Alongamento dos Braços
- Cruze um braço sobre o peito (30 seg cada)
- Alongue os braços acima da cabeça

### 4. Torção da Coluna
- Sentado, gire o tronco para a direita (30 seg)
- Repita para a esquerda

### 5. Alongamento das Pernas (se em pé)
- Flexione um joelho em direção ao peito
- Alongue a panturrilha

## Respiração:
Mantenha respiração profunda e lenta durante todos os movimentos.`,
    category: 'anxiety' as const,
    type: 'exercise' as const,
    estimatedReadTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  },
  {
    title: 'Caminhada Consciente de 10 Minutos',
    summary: 'Combine exercício físico com mindfulness para duplo benefício.',
    content: `# Caminhada Consciente de 10 Minutos

Transforme uma simples caminhada em uma poderosa prática de bem-estar.

## Preparação:
- Escolha um percurso familiar
- Vista roupas confortáveis
- Deixe o celular no silencioso

## Durante a caminhada:

### Primeiros 3 minutos: Consciência corporal
- Sinta os pés tocando o chão
- Notice o movimento natural dos braços
- Ajuste a postura: ombros relaxados, cabeça erguida

### Minutos 4-6: Respiração ritmada
- Sincronize a respiração com os passos
- 4 passos inspirando, 4 expirando
- Ajuste o ritmo conforme necessário

### Últimos 4 minutos: Consciência ambiental
- Observe cores, sons, cheiros
- Não julgue, apenas perceba
- Agradeça mentalmente pelo que observa

## Benefícios:
- Reduz cortisol (hormônio do estresse)
- Melhora humor e energia
- Fortalece conexão mente-corpo

**Ideal para pausas do trabalho ou início/fim do dia.**`,
    category: 'mindfulness' as const,
    type: 'exercise' as const,
    estimatedReadTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
  },

  // Self-care
  {
    title: 'Alimentos que Combatem a Ansiedade',
    summary: 'Descubra como sua alimentação pode ser uma aliada no controle da ansiedade.',
    content: `# Alimentos que Combatem a Ansiedade

A alimentação tem impacto direto no nosso humor e níveis de ansiedade.

## Alimentos Calmantes:

### 🥑 Ricos em Ômega-3:
- **Salmão, sardinha, atum**: 2-3 porções por semana
- **Nozes e amêndoas**: 1 punhado por dia
- **Sementes de chia e linhaça**: 1 colher de sopa

### 🍃 Fontes de Magnésio:
- **Folhas verdes**: espinafre, couve
- **Chocolate amargo** (70% cacau): 1-2 quadrados
- **Abacate**: rico em gorduras boas

### 🫖 Chás Relaxantes:
- **Camomila**: antes de dormir
- **Lavanda**: reduz tensão
- **Melissa**: acalma o sistema nervoso

## O que evitar:
- Excesso de cafeína
- Açúcar refinado
- Álcool em excesso
- Alimentos ultraprocessados

## Dica especial:
Prepare um "lanche da tranquilidade": mix de nozes + banana + quadrado de chocolate amargo.

## Horários importantes:
- Café da manhã rico em proteínas
- Evite jejuns prolongados
- Jantar leve 2h antes de dormir`,
    category: 'self-care' as const,
    type: 'reading' as const,
    estimatedReadTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'
  },
  {
    title: 'Higiene do Sono para Ansiedade',
    summary: 'Crie um ambiente e rotina que promovam sono reparador e reduzam a ansiedade.',
    content: `# Higiene do Sono para Ansiedade

O sono de qualidade é fundamental para regular o humor e controlar a ansiedade.

## Rotina noturna (1h antes de dormir):

### 📱 Desconexão digital:
- Modo noturno em todos os dispositivos
- Carregador fora do quarto
- Livro físico em vez de tela

### 🛁 Rituais de relaxamento:
- Banho morno (baixa temperatura corporal induz sono)
- Chá de camomila ou melissa
- Alongamentos suaves

### 🧠 Preparação mental:
- Anote 3 coisas boas do dia
- Liste tarefas de amanhã (tire da mente)
- 5 minutos de respiração profunda

## Ambiente ideal:

### 🌡️ Temperatura: 18-21°C
### 🌑 Escuridão total:
- Cortinas blackout
- Máscara de dormir se necessário

### 🔇 Silêncio:
- Tampões de ouvido
- Ruído branco se preferir

## Horários consistentes:
- Durma e acorde no mesmo horário
- Mesmo nos fins de semana (diferença máxima: 1h)

## Se não conseguir dormir:
- Levante após 20 minutos acordado na cama
- Atividade calma até sentir sono
- Evite olhar o relógio

**Meta: 7-9 horas de sono por noite.**`,
    category: 'self-care' as const,
    type: 'reading' as const,
    estimatedReadTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400'
  },

  // Técnicas para ansiedade
  {
    title: 'Técnica do Pensamento Alternativo',
    summary: 'Aprenda a questionar pensamentos ansiosos e criar perspectivas mais equilibradas.',
    content: `# Técnica do Pensamento Alternativo

Quando a ansiedade surge, nossos pensamentos podem se tornar distorcidos. Esta técnica ajuda a encontrar perspectivas mais realistas.

## Passo 1: Identifique o pensamento ansioso
Exemplo: *"Vou fazer papel de bobo na apresentação"*

## Passo 2: Questione o pensamento
Faça estas perguntas:
- Quais evidências eu tenho de que isso é verdade?
- Quais evidências contra?
- O que eu diria para um amigo nesta situação?
- Qual a probabilidade real disso acontecer?

## Passo 3: Crie um pensamento alternativo
- **Pensamento ansioso**: "Vou fazer papel de bobo"
- **Pensamento alternativo**: "Posso ficar nervoso, mas estou preparado e vou dar o meu melhor"

## Passo 4: Avalie a intensidade
- Ansiedade antes: 8/10
- Ansiedade depois: 4/10

## Distorções cognitivas comuns:
1. **Catastrofização**: imaginar o pior cenário
2. **Tudo ou nada**: ver apenas extremos
3. **Leitura mental**: achar que sabe o que outros pensam
4. **Personalização**: culpar-se por tudo

## Prática diária:
Anote 1 pensamento ansioso e trabalhe com essa técnica.

**Lembre-se: pensamentos são apenas pensamentos, não fatos.**`,
    category: 'anxiety' as const,
    type: 'reflection' as const,
    estimatedReadTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    title: 'Técnica de Aterramento 5-4-3-2-1',
    summary: 'Use seus sentidos para se reconectar com o presente e reduzir a ansiedade.',
    content: `# Técnica de Aterramento 5-4-3-2-1

Esta técnica usa os cinco sentidos para te trazer de volta ao momento presente quando a ansiedade surgir.

## Como fazer:

### 👀 5 coisas que você VÊ:
- Olhe ao redor conscientemente
- Nomeie mentalmente cada objeto
- Observe cores, formas, texturas
- Exemplo: "Vejo uma caneta azul, uma planta verde..."

### ✋ 4 coisas que você TOCA:
- Sinta diferentes texturas
- Pressione os pés no chão
- Toque uma superfície próxima
- Exemplo: "Sinto a mesa lisa, meus pés no chão..."

### 👂 3 coisas que você ESCUTA:
- Sons próximos e distantes
- Sua própria respiração
- Ruídos do ambiente
- Exemplo: "Escuto carros, minha respiração, o ar condicionado..."

### 👃 2 coisas que você CHEIRA:
- Aromas do ambiente
- Seu perfume ou desodorante
- Exemplo: "Cheiro café, ar fresco..."

### 👅 1 coisa que você PROVA:
- Sabor atual na boca
- Beba um gole de água
- Exemplo: "Gosto de hortelã da goma..."

## Quando usar:
- Ataques de pânico
- Ansiedade aguda
- Pensamentos acelerados
- Sensação de desrealização

**Esta técnica interrompe o ciclo de ansiedade e te ancora no presente.**`,
    category: 'anxiety' as const,
    type: 'reflection' as const,
    estimatedReadTime: 3,
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400'
  }
]

export default class SeedSuggestions extends BaseCommand {
  static commandName = 'seed:suggestions'
  static description = 'Seed the database with initial suggestions'

  async run() {
    this.logger.info('Starting suggestions seed...')

    try {
      // Clear existing suggestions
      await db.rawQuery('DELETE FROM user_suggestions')
      await db.rawQuery('DELETE FROM suggestions')
      
      this.logger.info('Cleared existing suggestions')

      // Insert new suggestions
      for (const suggestionData of suggestions) {
        await Suggestion.create(suggestionData)
        this.logger.info(`Created suggestion: ${suggestionData.title}`)
      }

      this.logger.success(`Successfully seeded ${suggestions.length} suggestions!`)
    } catch (error) {
      this.logger.error('Error seeding suggestions:')
      this.logger.error(error.message)
      throw error
    }
  }
}