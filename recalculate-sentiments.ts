import { BaseCommand } from '@adonisjs/core/ace'
import db from '@adonisjs/lucid/services/db'
import { calculateSentimentScore } from './app/types/journal_types.js'

async function recalculateSentiments() {
  console.log('🔄 Recalculando sentiments de todas as entradas...\n')
  
  try {
    // Buscar todas as entradas
    const entries = await db
      .from('journal_entries')
      .select('id', 'content', 'sentiment_score')
      .orderBy('created_at', 'desc')
    
    console.log(`📊 Total de entradas encontradas: ${entries.length}\n`)
    
    let updatedCount = 0
    let errorCount = 0
    
    for (const entry of entries) {
      try {
        const newSentiment = calculateSentimentScore(entry.content)
        const oldSentiment = entry.sentiment_score
        
        // Atualizar no banco
        await db
          .from('journal_entries')
          .where('id', entry.id)
          .update({ sentiment_score: newSentiment })
        
        updatedCount++
        
        // Log das mudanças significativas
        if (Math.abs(newSentiment - (oldSentiment || 0)) > 0.3) {
          console.log(`📝 ID: ${entry.id.slice(0, 8)}...`)
          console.log(`   Conteúdo: "${entry.content.slice(0, 50)}..."`)
          console.log(`   Antigo: ${oldSentiment} → Novo: ${newSentiment}`)
          console.log('')
        }
      } catch (error) {
        console.error(`❌ Erro ao atualizar entrada ${entry.id}:`, error.message)
        errorCount++
      }
    }
    
    console.log('\n✅ Recálculo concluído!')
    console.log(`   Atualizadas: ${updatedCount}`)
    console.log(`   Erros: ${errorCount}`)
    
    // Mostrar estatísticas
    const stats = await db
      .from('journal_entries')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('AVG(sentiment_score) as avg_sentiment'),
        db.raw('MIN(sentiment_score) as min_sentiment'),
        db.raw('MAX(sentiment_score) as max_sentiment'),
        db.raw('COUNT(CASE WHEN sentiment_score < 0 THEN 1 END) as negative_count'),
        db.raw('COUNT(CASE WHEN sentiment_score = 0 THEN 1 END) as neutral_count'),
        db.raw('COUNT(CASE WHEN sentiment_score > 0 THEN 1 END) as positive_count')
      )
      .first()
    
    console.log('\n📈 Estatísticas de Sentiment:')
    console.log(`   Média: ${Number(stats.avg_sentiment).toFixed(3)}`)
    console.log(`   Mínimo: ${stats.min_sentiment}`)
    console.log(`   Máximo: ${stats.max_sentiment}`)
    console.log(`   Negativas: ${stats.negative_count} (${((stats.negative_count / stats.total) * 100).toFixed(1)}%)`)
    console.log(`   Neutras: ${stats.neutral_count} (${((stats.neutral_count / stats.total) * 100).toFixed(1)}%)`)
    console.log(`   Positivas: ${stats.positive_count} (${((stats.positive_count / stats.total) * 100).toFixed(1)}%)`)
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
    throw error
  } finally {
    await db.manager.closeAll()
  }
}

// Run the script
recalculateSentiments()
  .then(() => {
    console.log('\n🎉 Script finalizado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script falhou:', error)
    process.exit(1)
  })
