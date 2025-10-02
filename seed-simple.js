/**
 * Simple script to seed suggestions data
 */

import { Application } from '@adonisjs/core/app'
import Suggestion from './app/modules/suggestions/models/suggestion.js'

const app = new Application(new URL('./', import.meta.url))

const suggestions = [
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
  },
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
  }
]

async function seedSuggestions() {
  console.log('🌱 Starting suggestions seed...')
  
  try {
    // Boot the application
    await app.boot()
    await app.start()

    console.log('📝 Creating suggestions...')
    
    for (const suggestionData of suggestions) {
      await Suggestion.create(suggestionData)
      console.log(`✅ Created: ${suggestionData.title}`)
    }

    console.log(`🎉 Successfully seeded ${suggestions.length} suggestions!`)
  } catch (error) {
    console.error('❌ Error seeding suggestions:', error)
  } finally {
    await app.terminate()
  }
}

seedSuggestions()