import JournalEntry from '#models/journal_entry'
import { DateTime } from 'luxon'

export class JournalAnalyticsService {
  
  /**
   * Retorna analytics completos do journal
   */
  static async getCompleteAnalytics(userId: string) {
    try {
      const entries = await JournalEntry.query()
        .where('user_id', userId)
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc')

      if (entries.length === 0) {
        return this.getEmptyAnalytics()
      }

      const [
        basicStats,
        streakData,
        moodDistribution,
        timelineData,
        weeklyProgress
      ] = await Promise.all([
        this.calculateBasicStats(entries),
        this.getStreakData(userId),
        this.getMoodDistribution(userId),
        this.getTimelineData(userId, 7),
        this.getWeeklyProgress(entries)
      ])

      return {
        ...basicStats,
        streak: streakData,
        moodDistribution,
        timeline: timelineData,
        weeklyProgress
      }
    } catch (error) {
      console.error('Error getting complete analytics:', error)
      return this.getEmptyAnalytics()
    }
  }

  /**
   * Calcula estatísticas básicas
   */
  private static calculateBasicStats(entries: JournalEntry[]) {
    const uniqueDaysSet = new Set(
      entries.map(entry => entry.createdAt.toFormat('yyyy-MM-dd'))
    )
    
    const totalEntries = entries.length
    const uniqueDays = uniqueDaysSet.size
    const totalWords = entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0)
    const avgWordsPerEntry = Math.round(totalWords / entries.length)

    // Análise de sentiment/positividade
    const positiveEntries = entries.filter(entry => {
      if (entry.sentimentScore && entry.sentimentScore > 0.1) return true
      
      // Fallback: verificar mood tags positivos
      if (entry.moodTags) {
        const moodTags = Array.isArray(entry.moodTags) ? entry.moodTags : JSON.parse(entry.moodTags || '[]')
        return moodTags.some((tag: any) => tag.category === 'positive')
      }
      return false
    })
    
    const percentPositive = Math.round((positiveEntries.length / entries.length) * 100)

    return {
      totalEntries,
      uniqueDays,
      totalWords,
      avgWordsPerEntry,
      percentPositive,
      lastEntryDate: entries[0]?.createdAt.toFormat('yyyy-MM-dd') || null
    }
  }

  /**
   * Retorna dados detalhados do streak
   */
  static async getStreakData(userId: string) {
    try {
      const entries = await JournalEntry.query()
        .where('user_id', userId)
        .whereNull('deleted_at')
        .select(['created_at'])
        .orderBy('created_at', 'desc')

      if (entries.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          streakDates: [],
          isActiveToday: false,
          nextGoalDate: DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd')
        }
      }

      const uniqueDates = Array.from(new Set(
        entries.map(entry => entry.createdAt.toFormat('yyyy-MM-dd'))
      )).sort().reverse()

      const today = DateTime.now().toFormat('yyyy-MM-dd')
      const yesterday = DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd')
      
      // Calcular streak atual
      let currentStreak = 0
      let checkDate = DateTime.now()
      
      // Verificar se escreveu hoje ou ontem para manter o streak
      const hasRecentEntry = uniqueDates[0] === today || uniqueDates[0] === yesterday
      
      if (hasRecentEntry) {
        for (const date of uniqueDates) {
          if (date === checkDate.toFormat('yyyy-MM-dd')) {
            currentStreak++
            checkDate = checkDate.minus({ days: 1 })
          } else if (date === checkDate.minus({ days: 1 }).toFormat('yyyy-MM-dd')) {
            // Pular um dia se necessário
            checkDate = checkDate.minus({ days: 1 })
            if (date === checkDate.toFormat('yyyy-MM-dd')) {
              currentStreak++
              checkDate = checkDate.minus({ days: 1 })
            }
          } else {
            break
          }
        }
      }

      // Calcular streak mais longa
      let longestStreak = 0
      let tempStreak = 0
      
      for (let i = 0; i < uniqueDates.length; i++) {
        tempStreak = 1
        let currentDate = DateTime.fromFormat(uniqueDates[i], 'yyyy-MM-dd')
        
        for (let j = i + 1; j < uniqueDates.length; j++) {
          const nextExpectedDate = currentDate.minus({ days: 1 }).toFormat('yyyy-MM-dd')
          if (uniqueDates[j] === nextExpectedDate) {
            tempStreak++
            currentDate = DateTime.fromFormat(uniqueDates[j], 'yyyy-MM-dd')
          } else {
            break
          }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak)
      }

      return {
        currentStreak,
        longestStreak,
        streakDates: uniqueDates.slice(0, currentStreak),
        isActiveToday: uniqueDates[0] === today,
        nextGoalDate: DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd')
      }
    } catch (error) {
      console.error('Error calculating streak data:', error)
      return {
        currentStreak: 0,
        longestStreak: 0,
        streakDates: [],
        isActiveToday: false,
        nextGoalDate: DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd')
      }
    }
  }

  /**
   * Retorna distribuição detalhada de humores
   */
  static async getMoodDistribution(userId: string) {
    try {
      const entries = await JournalEntry.query()
        .where('user_id', userId)
        .whereNull('deleted_at')
        .select(['mood_tags', 'sentiment_score'])
        .orderBy('created_at', 'desc')

      if (entries.length === 0) {
        return {
          categories: {
            positive: 0,
            neutral: 0,
            negative: 0
          },
          topMoods: [],
          sentimentAverage: 0
        }
      }

      const moodMap = new Map<string, { count: number, category: string, emoji: string }>()
      let sentimentTotal = 0
      let sentimentCount = 0
      let categoryCount = { positive: 0, neutral: 0, negative: 0 }

      entries.forEach(entry => {
        // Processar sentiment score
        if (entry.sentimentScore !== null) {
          sentimentTotal += entry.sentimentScore
          sentimentCount++
        }

        // Processar mood tags
        if (entry.moodTags) {
          const moodTags = Array.isArray(entry.moodTags) ? entry.moodTags : JSON.parse(entry.moodTags || '[]')
          
          moodTags.forEach((tag: any) => {
            // Use label for display, fallback to id for legacy data
            const key = tag.label || tag.id
            if (!moodMap.has(key)) {
              moodMap.set(key, {
                count: 0,
                category: tag.category || 'neutral',
                emoji: tag.emoji || '😐'
              })
            }
            
            const moodData = moodMap.get(key)!
            moodData.count++
            
            // Contar categorias
            const category = tag.category || 'neutral'
            if (category in categoryCount) {
              categoryCount[category as keyof typeof categoryCount]++
            }
          })
        }
      })

      const topMoods = Array.from(moodMap.entries())
        .map(([mood, data]) => ({
          mood,
          emoji: data.emoji,
          category: data.category,
          count: data.count,
          percentage: Math.round((data.count / entries.length) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

      const sentimentAverage = sentimentCount > 0 ? sentimentTotal / sentimentCount : 0

      return {
        categories: categoryCount,
        topMoods,
        sentimentAverage: Math.round(sentimentAverage * 100) / 100
      }
    } catch (error) {
      console.error('Error getting mood distribution:', error)
      return {
        categories: { positive: 0, neutral: 0, negative: 0 },
        topMoods: [],
        sentimentAverage: 0
      }
    }
  }

  /**
   * Retorna dados da timeline dos últimos N dias
   */
  static async getTimelineData(userId: string, days: number = 7) {
    try {
      const cutoffDate = DateTime.now().minus({ days: days - 1 }).startOf('day')
      
      const entries = await JournalEntry.query()
        .where('user_id', userId)
        .whereNull('deleted_at')
        .where('created_at', '>=', cutoffDate.toISO()!)
        .select(['mood_tags', 'sentiment_score', 'created_at'])
        .orderBy('created_at', 'asc')

      // Criar array com todos os dias dos últimos N dias
      const timeline = []
      for (let i = days - 1; i >= 0; i--) {
        const date = DateTime.now().minus({ days: i })
        const dateStr = date.toFormat('yyyy-MM-dd')
        
        // Buscar entradas deste dia
        const dayEntries = entries.filter(entry => 
          entry.createdAt.toFormat('yyyy-MM-dd') === dateStr
        )

        let moodLevel = 'neutro'
        let moodColor = '#FFA500' // Orange padrão
        let moodEmoji = '😐'
        
        if (dayEntries.length > 0) {
          // Calcular humor baseado nas mood tags em vez de sentiment score
          const allMoodTags: any[] = []
          
          dayEntries.forEach(entry => {
            if (entry.moodTags) {
              const moodTags = Array.isArray(entry.moodTags) ? entry.moodTags : JSON.parse(entry.moodTags || '[]')
              allMoodTags.push(...moodTags)
            }
          })
          
          // Determinar nível de humor baseado nas categorias dos mood tags
          if (allMoodTags.length > 0) {
            const categoryCount = { positive: 0, neutral: 0, negative: 0 }
            
            allMoodTags.forEach(tag => {
              const category = tag.category || 'neutral'
              if (category in categoryCount) {
                categoryCount[category as keyof typeof categoryCount]++
              }
            })
            
            // Determinar humor majoritário
            const totalTags = allMoodTags.length
            const positiveRatio = categoryCount.positive / totalTags
            const negativeRatio = categoryCount.negative / totalTags
            
            if (positiveRatio > 0.6) {
              moodLevel = 'radiante'
              moodColor = '#4CAF50' // Green
            } else if (positiveRatio > negativeRatio) {
              moodLevel = 'bem'
              moodColor = '#2196F3' // Blue
            } else if (negativeRatio > 0.5) {
              moodLevel = 'difícil'
              moodColor = '#9C27B0' // Purple
            } else {
              moodLevel = 'neutro'
              moodColor = '#FFA500' // Orange
            }
            
            // Pegar emoji mais comum do dia
            const emojiCount = new Map<string, number>()
            allMoodTags.forEach(tag => {
              const emoji = tag.emoji || '😐'
              emojiCount.set(emoji, (emojiCount.get(emoji) || 0) + 1)
            })
            
            moodEmoji = Array.from(emojiCount.entries())
              .sort((a, b) => b[1] - a[1])[0][0]
          }
        }

        timeline.push({
          date: dateStr,
          dayOfWeek: date.weekdayShort,
          dayNumber: date.day,
          moodLevel,
          moodColor,
          moodEmoji,
          hasEntry: dayEntries.length > 0,
          entriesCount: dayEntries.length,
          isToday: dateStr === DateTime.now().toFormat('yyyy-MM-dd')
        })
      }

      return timeline
    } catch (error) {
      console.error('Error getting timeline data:', error)
      return []
    }
  }

  /**
   * Retorna progresso semanal das últimas 4 semanas
   */
  private static getWeeklyProgress(entries: JournalEntry[]) {
    const weeklyProgress = []
    
    for (let i = 0; i < 4; i++) {
      const weekStart = DateTime.now().minus({ weeks: i }).startOf('week')
      const weekEnd = weekStart.endOf('week')
      
      const weekEntries = entries.filter(entry => {
        const entryDate = entry.createdAt
        return entryDate >= weekStart && entryDate <= weekEnd
      })

      weeklyProgress.unshift({
        week: `Semana ${4 - i}`,
        entries: weekEntries.length,
        startDate: weekStart.toFormat('yyyy-MM-dd'),
        endDate: weekEnd.toFormat('yyyy-MM-dd'),
        avgSentiment: weekEntries.length > 0 
          ? weekEntries.reduce((sum, entry) => sum + (entry.sentimentScore || 0), 0) / weekEntries.length
          : 0
      })
    }

    return weeklyProgress
  }

  /**
   * Retorna estrutura vazia para quando não há dados
   */
  private static getEmptyAnalytics() {
    return {
      totalEntries: 0,
      uniqueDays: 0,
      totalWords: 0,
      avgWordsPerEntry: 0,
      percentPositive: 0,
      lastEntryDate: null,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        streakDates: [],
        isActiveToday: false,
        nextGoalDate: DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd')
      },
      moodDistribution: {
        categories: { positive: 0, neutral: 0, negative: 0 },
        topMoods: [],
        sentimentAverage: 0
      },
      timeline: [],
      weeklyProgress: []
    }
  }

  /**
   * Gera relatório terapêutico em HTML
   */
  static async generateTherapeuticReport(userId: string): Promise<string> {
    try {
      // Buscar dados completos
      const analytics = await this.getCompleteAnalytics(userId)
      const entries = await JournalEntry.query()
        .where('user_id', userId)
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc')
        .limit(10) // Últimas 10 entradas para análise

      // Gerar HTML do relatório
      const htmlContent = this.generateReportHTML(analytics, entries)
      
      return htmlContent
    } catch (error) {
      console.error('Error generating therapeutic report:', error)
      throw new Error('Falha ao gerar relatório terapêutico')
    }
  }

  /**
   * Gera HTML do relatório terapêutico
   */
  private static generateReportHTML(analytics: any, entries: JournalEntry[]): string {
    const currentDate = DateTime.now().toFormat('dd/MM/yyyy')
    const reportPeriod = entries.length > 0 ? 
      `${entries[entries.length - 1].createdAt.toFormat('dd/MM/yyyy')} até ${entries[0].createdAt.toFormat('dd/MM/yyyy')}` :
      'Sem dados disponíveis'

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório Terapêutico - PulseZen</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #4A90E2;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #4A90E2;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 16px;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #4A90E2;
          border-bottom: 2px solid #E8F4FD;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: #F8FBFF;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #4A90E2;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #4A90E2;
        }
        .stat-label {
          color: #666;
          font-size: 14px;
        }
        .mood-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .timeline-day {
          display: inline-block;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          text-align: center;
          line-height: 40px;
          margin: 5px;
          font-weight: bold;
          color: white;
        }
        .insights {
          background: #FFF9E6;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #FFA500;
        }
        .recommendation {
          background: #E8F5E8;
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
          border-left: 4px solid #4CAF50;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo">🧠 PulseZen</div>
        <div class="subtitle">Relatório Terapêutico de Saúde Mental</div>
        <div style="margin-top: 10px; font-size: 14px;">
          <strong>Data do Relatório:</strong> ${currentDate}<br>
          <strong>Período Analisado:</strong> ${reportPeriod}
        </div>
      </div>

      <!-- Resumo Executivo -->
      <div class="section">
        <h2 class="section-title">📊 Resumo Executivo</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${analytics.totalEntries}</div>
            <div class="stat-label">Total de Registros</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${analytics.uniqueDays}</div>
            <div class="stat-label">Dias Ativos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${analytics.avgWordsPerEntry}</div>
            <div class="stat-label">Palavras por Registro</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${analytics.percentPositive}%</div>
            <div class="stat-label">Registros Positivos</div>
          </div>
        </div>
      </div>

      <!-- Padrões Emocionais -->
      <div class="section">
        <h2 class="section-title">💭 Padrões Emocionais Identificados</h2>
        <div style="margin-bottom: 20px;">
          <h3>Distribuição de Humores:</h3>
          ${analytics.moodDistribution.topMoods.map((mood: any) => `
            <div class="mood-item">
              <span>${mood.emoji || '😐'} ${mood.mood}</span>
              <span><strong>${mood.count} vezes (${mood.percentage}%)</strong></span>
            </div>
          `).join('')}
        </div>
        
        <div class="insights">
          <h3>🔍 Insights Clínicos:</h3>
          <ul>
            <li><strong>Consistência:</strong> ${this.getConsistencyInsight(analytics.streak)}</li>
            <li><strong>Padrão Emocional:</strong> ${this.getEmotionalPattern(analytics)}</li>
            <li><strong>Engajamento:</strong> ${this.getEngagementInsight(analytics)}</li>
          </ul>
        </div>
      </div>

      <!-- Timeline Semanal -->
      <div class="section">
        <h2 class="section-title">📈 Evolução Semanal</h2>
        <div style="text-align: center; margin: 20px 0;">
          ${analytics.timeline.map((day: any) => `
            <div class="timeline-day" style="background-color: ${day.moodColor};">
              ${day.dayNumber}
            </div>
          `).join('')}
        </div>
        <p style="text-align: center; color: #666; font-size: 14px;">
          Últimos 7 dias - Cores representam níveis de humor predominante
        </p>
      </div>

      <div class="page-break"></div>

      <!-- Recomendações Terapêuticas -->
      <div class="section">
        <h2 class="section-title">💡 Recomendações Terapêuticas</h2>
        ${this.generateTherapeuticRecommendations(analytics).map((rec: string) => `
          <div class="recommendation">
            ${rec}
          </div>
        `).join('')}
      </div>

      <!-- Amostra de Conteúdo -->
      <div class="section">
        <h2 class="section-title">📝 Amostra de Registros Recentes</h2>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
          <em>Últimos registros para contexto terapêutico (conteúdo resumido)</em>
        </p>
        ${entries.slice(0, 3).map((entry: JournalEntry, index: number) => `
          <div style="background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 8px;">
            <div style="font-weight: bold; color: #4A90E2; margin-bottom: 8px;">
              Registro ${index + 1} - ${entry.createdAt.toFormat('dd/MM/yyyy')}
            </div>
            <div style="font-size: 14px;">
              <strong>Humor:</strong> ${entry.moodTags || 'Não especificado'}<br>
              <strong>Palavras:</strong> ${entry.wordCount}<br>
              <strong>Resumo:</strong> ${entry.content ? entry.content.substring(0, 150) + '...' : 'Sem conteúdo'}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>PulseZen</strong> - Plataforma de Saúde Mental Digital</p>
        <p>Este relatório foi gerado automaticamente e deve ser interpretado por profissionais qualificados.</p>
        <p>Para mais informações: suporte@pulsezen.com</p>
      </div>
    </body>
    </html>
    `
  }

  /**
   * Helpers para insights clínicos
   */
  private static getConsistencyInsight(streak: any): string {
    if (streak.currentStreak >= 7) {
      return `Excelente: ${streak.currentStreak} dias consecutivos demonstram comprometimento significativo`
    } else if (streak.currentStreak >= 3) {
      return `Bom: ${streak.currentStreak} dias consecutivos indicam engajamento crescente`
    } else {
      return `Inconsistente: Apenas ${streak.currentStreak} dia(s) - necessita incentivo para regularidade`
    }
  }

  private static getEmotionalPattern(analytics: any): string {
    if (analytics.percentPositive >= 60) {
      return `Predominantemente positivo (${analytics.percentPositive}%) - indica estabilidade emocional`
    } else if (analytics.percentPositive >= 40) {
      return `Equilibrado (${analytics.percentPositive}% positivo) - flutuações normais observadas`
    } else {
      return `Desafiador (${analytics.percentPositive}% positivo) - requer atenção terapêutica focada`
    }
  }

  private static getEngagementInsight(analytics: any): string {
    const avgPerDay = analytics.totalEntries / Math.max(analytics.uniqueDays, 1)
    if (avgPerDay >= 2) {
      return `Alto: ${avgPerDay.toFixed(1)} registros/dia demonstram alta motivação`
    } else if (avgPerDay >= 1) {
      return `Moderado: ${avgPerDay.toFixed(1)} registros/dia indicam engajamento regular`
    } else {
      return `Baixo: ${avgPerDay.toFixed(1)} registros/dia - necessita estratégias de motivação`
    }
  }

  private static generateTherapeuticRecommendations(analytics: any): string[] {
    const recommendations = []

    // Recomendações baseadas na consistência
    if (analytics.streak.currentStreak < 3) {
      recommendations.push(
        '🎯 <strong>Estabelecer Rotina:</strong> Implementar horários fixos para escrita pode melhorar a consistência e criar um hábito terapêutico sustentável.'
      )
    }

    // Recomendações baseadas no humor
    if (analytics.percentPositive < 40) {
      recommendations.push(
        '🌱 <strong>Técnicas de Regulação Emocional:</strong> Considerar CBT (Terapia Cognitivo-Comportamental) para trabalhar padrões de pensamento e desenvolver estratégias de enfrentamento.'
      )
      recommendations.push(
        '🧘 <strong>Práticas de Mindfulness:</strong> Incorporar exercícios de atenção plena pode ajudar na identificação e processamento de emoções difíceis.'
      )
    }

    // Recomendações baseadas no engajamento
    if (analytics.avgWordsPerEntry < 15) {
      recommendations.push(
        '✍️ <strong>Expressão Expandida:</strong> Encorajar registros mais detalhados pode aprofundar a auto-reflexão e fornecer mais insights terapêuticos.'
      )
    }

    // Recomendação geral
    recommendations.push(
      '📈 <strong>Monitoramento Contínuo:</strong> Revisões regulares dos padrões identificados podem orientar ajustes na abordagem terapêutica e medir o progresso.'
    )

    return recommendations
  }
}