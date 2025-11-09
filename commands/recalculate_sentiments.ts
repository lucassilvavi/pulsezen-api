import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import { calculateSentimentScore } from '../app/types/journal_types.js'

export default class RecalculateSentiments extends BaseCommand {
  static commandName = 'recalculate:sentiments'
  static description = 'Recalculate sentiment scores for all journal entries'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('🔄 Recalculando sentiments de todas as entradas...\n')
    
    try {
      // Buscar todas as entradas
      const entries = await db
        .from('journal_entries')
        .select('id', 'content', 'sentiment_score')
        .orderBy('created_at', 'desc')
      
      this.logger.info(`📊 Total de entradas encontradas: ${entries.length}\n`)
      
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
            this.logger.info(`📝 ID: ${entry.id.slice(0, 8)}...`)
            this.logger.info(`   Conteúdo: "${entry.content.slice(0, 50)}..."`)
            this.logger.info(`   Antigo: ${oldSentiment} → Novo: ${newSentiment}`)
            this.logger.info('')
          }
        } catch (error) {
          this.logger.error(`❌ Erro ao atualizar entrada ${entry.id}: ${error.message}`)
          errorCount++
        }
      }
      
      this.logger.info('\n✅ Recálculo concluído!')
      this.logger.info(`   Atualizadas: ${updatedCount}`)
      this.logger.info(`   Erros: ${errorCount}`)
      
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
      
      this.logger.info('\n📈 Estatísticas de Sentiment:')
      this.logger.info(`   Média: ${Number(stats.avg_sentiment).toFixed(3)}`)
      this.logger.info(`   Mínimo: ${stats.min_sentiment}`)
      this.logger.info(`   Máximo: ${stats.max_sentiment}`)
      this.logger.info(`   Negativas: ${stats.negative_count} (${((stats.negative_count / stats.total) * 100).toFixed(1)}%)`)
      this.logger.info(`   Neutras: ${stats.neutral_count} (${((stats.neutral_count / stats.total) * 100).toFixed(1)}%)`)
      this.logger.info(`   Positivas: ${stats.positive_count} (${((stats.positive_count / stats.total) * 100).toFixed(1)}%)`)
      
    } catch (error) {
      this.logger.error('❌ Erro geral:', error)
      throw error
    }
  }
}