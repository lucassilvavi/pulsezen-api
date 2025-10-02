// Simple console test to create suggestions
import { Application } from '@adonisjs/core/app'

const application = new Application(new URL('./', import.meta.url))

await application.boot()
await application.start()

const Suggestion = (await import('./app/modules/suggestions/models/suggestion.js')).default

try {
  console.log('Creating suggestions...')
  
  await Suggestion.create({
    title: 'Técnica de Respiração 4-7-8',
    summary: 'Uma técnica simples e eficaz para reduzir a ansiedade e promover o relaxamento.',
    content: `# Técnica de Respiração 4-7-8

## Como fazer:
1. Inspire pelo nariz contando até 4
2. Segure a respiração contando até 7  
3. Expire pela boca contando até 8

Repita 4 ciclos.`,
    category: 'mindfulness',
    type: 'meditation',
    estimatedReadTime: 3,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  })
  
  await Suggestion.create({
    title: 'Técnica de Aterramento 5-4-3-2-1',
    summary: 'Use seus sentidos para se reconectar com o presente e reduzir a ansiedade.',
    content: `# Técnica de Aterramento 5-4-3-2-1

## Como fazer:
- 5 coisas que você VÊ
- 4 coisas que você TOCA
- 3 coisas que você ESCUTA
- 2 coisas que você CHEIRA
- 1 coisa que você PROVA`,
    category: 'anxiety',
    type: 'reflection',
    estimatedReadTime: 3,
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400'
  })
  
  await Suggestion.create({
    title: 'Exercícios de Alongamento',
    summary: 'Movimentos simples que liberam tensão física e reduzem o estresse.',
    content: `# Exercícios de Alongamento

## Sequência:
- Alongamento do pescoço
- Rotação dos ombros  
- Alongamento dos braços
- Torção da coluna

Mantenha respiração profunda.`,
    category: 'anxiety',
    type: 'exercise',
    estimatedReadTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  })
  
  await Suggestion.create({
    title: 'Alimentos que Combatem a Ansiedade',
    summary: 'Descubra como sua alimentação pode ser uma aliada no controle da ansiedade.',
    content: `# Alimentos que Combatem a Ansiedade

## Alimentos Calmantes:
- Ricos em Ômega-3: salmão, nozes
- Fontes de Magnésio: folhas verdes, chocolate amargo
- Chás Relaxantes: camomila, lavanda

Evite excesso de cafeína e açúcar.`,
    category: 'self-care',
    type: 'reading',
    estimatedReadTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'
  })
  
  await Suggestion.create({
    title: 'Meditação Mindfulness de 5 Minutos',
    summary: 'Uma meditação guiada rápida para aumentar a consciência do momento presente.',
    content: `# Meditação Mindfulness de 5 Minutos

## Preparação:
- Local silencioso
- Posição confortável
- Olhos fechados

## Prática:
1. Foque na respiração (2 min)
2. Escaneie o corpo (2 min)  
3. Integração (1 min)`,
    category: 'mindfulness',
    type: 'meditation',
    estimatedReadTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400'
  })
  
  console.log('✅ 5 suggestions created successfully!')
  
} catch (error) {
  console.error('❌ Error creating suggestions:', error)
} finally {
  await application.terminate()
}