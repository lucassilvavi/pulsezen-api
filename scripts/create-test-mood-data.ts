/**
 * Script para criar dados de teste para predições
 */

import Database from '@adonisjs/lucid/services/db'

async function createTestMoodData() {
  const userId = '34577c74-a74a-4d03-9401-49ec486a05d9' // User criado anteriormente
  
  // Criar mood entries para os últimos 7 dias
  const entries = []
  const now = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Simular diferentes moods ao longo dos dias
    const moods = ['pessimo', 'mal', 'neutro', 'bem', 'excelente']
    const periods = ['manha', 'tarde', 'noite']
    
    for (const period of periods) {
      const mood = moods[Math.floor(Math.random() * moods.length)]
      
      entries.push({
        user_id: userId,
        mood_level: mood,
        period: period,
        date: date.toISOString().split('T')[0],
        timestamp: Math.floor(date.getTime() / 1000),
        created_at: date,
        updated_at: date
      })
    }
  }
  
  try {
    // Inserir todas as entradas
    await Database.table('mood_entries').insert(entries)
    console.log(`✅ Criadas ${entries.length} mood entries para teste`)
    
    // Verificar se foram inseridas
    const count = await Database.from('mood_entries').where('user_id', userId).count('* as total')
    console.log(`📊 Total de mood entries para usuário: ${count[0].total}`)
    
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestMoodData()
    .then(() => {
      console.log('✅ Script finalizado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro:', error)
      process.exit(1)
    })
}

export { createTestMoodData }