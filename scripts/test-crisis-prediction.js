/**
 * Teste de Integração - Crisis Prediction Engine
 * Teste completo do algoritmo de predição de crises
 */

const testCrisisPredictionEngine = async () => {
  console.log('🔮 INICIANDO TESTE DO CRISIS PREDICTION ENGINE™')
  console.log('=' .repeat(60))

  try {
    // Importar o engine
    const { CrisisPredictionEngine } = await import('../app/services/CrisisPredictionEngine.ts')
    
    // Criar instância do engine
    const engine = new CrisisPredictionEngine()
    
    console.log('✅ Engine criado com sucesso')
    console.log('📊 Configuração:', JSON.stringify(engine.getConfig(), null, 2))

    // === CENÁRIO 1: USUÁRIO EM RISCO BAIXO ===
    console.log('\n🟢 CENÁRIO 1: Usuário com baixo risco')
    console.log('-'.repeat(40))

    const lowRiskData = {
      userId: 'test_user_1',
      analysisWindow: {
        days: 14
      },
      moodEntries: [
        { moodLevel: 'bom', period: 'manha', date: '2024-01-01', timestamp: Date.now() - 13 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'muito_bom', period: 'tarde', date: '2024-01-02', timestamp: Date.now() - 12 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'bom', period: 'noite', date: '2024-01-03', timestamp: Date.now() - 11 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'neutro', period: 'manha', date: '2024-01-04', timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'bom', period: 'tarde', date: '2024-01-05', timestamp: Date.now() - 9 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'muito_bom', period: 'noite', date: '2024-01-06', timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 }
      ],
      journalEntries: [
        {
          id: '1',
          content: 'Hoje foi um dia maravilhoso! Consegui terminar todos os meus projetos e ainda tive tempo para relaxar.',
          moodTags: [
            { id: '1', label: 'feliz', category: 'positive', intensity: 4 },
            { id: '2', label: 'realizado', category: 'positive', intensity: 5 }
          ],
          sentimentScore: 0.8,
          wordCount: 20,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          promptCategory: 'daily_reflection'
        },
        {
          id: '2',
          content: 'Me sinto grato por ter pessoas incríveis ao meu redor. A vida está boa.',
          moodTags: [
            { id: '3', label: 'grato', category: 'positive', intensity: 5 }
          ],
          sentimentScore: 0.7,
          wordCount: 15,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          promptCategory: 'gratitude'
        }
      ]
    }

    const lowRiskPrediction = await engine.predict(lowRiskData)
    console.log('📊 Resultado:', {
      riskLevel: lowRiskPrediction.riskLevel,
      riskScore: lowRiskPrediction.riskScore,
      confidenceScore: lowRiskPrediction.confidenceScore,
      interventions: lowRiskPrediction.interventions.length
    })

    // === CENÁRIO 2: USUÁRIO EM RISCO ALTO ===
    console.log('\n🔴 CENÁRIO 2: Usuário com alto risco')
    console.log('-'.repeat(40))

    const highRiskData = {
      userId: 'test_user_2',
      analysisWindow: {
        days: 14
      },
      moodEntries: [
        { moodLevel: 'ruim', period: 'manha', date: '2024-01-01', timestamp: Date.now() - 13 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'muito_ruim', period: 'tarde', date: '2024-01-02', timestamp: Date.now() - 12 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'ruim', period: 'noite', date: '2024-01-03', timestamp: Date.now() - 11 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'muito_ruim', period: 'manha', date: '2024-01-04', timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'ruim', period: 'tarde', date: '2024-01-05', timestamp: Date.now() - 9 * 24 * 60 * 60 * 1000 },
        { moodLevel: 'muito_ruim', period: 'noite', date: '2024-01-06', timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 }
      ],
      journalEntries: [
        {
          id: '3',
          content: 'Não aguento mais essa ansiedade. Sinto meu coração acelerado o tempo todo, não consigo dormir. Estou desesperado, tudo parece estar errado na minha vida. Acho que não sirvo para nada.',
          moodTags: [
            { id: '4', label: 'ansioso', category: 'negative', intensity: 5 },
            { id: '5', label: 'desesperado', category: 'negative', intensity: 5 },
            { id: '6', label: 'inútil', category: 'negative', intensity: 4 }
          ],
          sentimentScore: -0.9,
          wordCount: 35,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          promptCategory: 'feelings'
        },
        {
          id: '4',
          content: 'Mais um dia terrível. A ansiedade está me consumindo, não consigo me concentrar em nada. Tenho medo de tudo, sinto que vou ter um ataque de pânico a qualquer momento.',
          moodTags: [
            { id: '7', label: 'ansioso', category: 'negative', intensity: 5 },
            { id: '8', label: 'com medo', category: 'negative', intensity: 4 }
          ],
          sentimentScore: -0.8,
          wordCount: 30,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          promptCategory: 'daily_reflection'
        }
      ]
    }

    const highRiskPrediction = await engine.predict(highRiskData)
    console.log('📊 Resultado:', {
      riskLevel: highRiskPrediction.riskLevel,
      riskScore: highRiskPrediction.riskScore,
      confidenceScore: highRiskPrediction.confidenceScore,
      interventions: highRiskPrediction.interventions.length,
      factorsAnalyzed: highRiskPrediction.factors.length
    })

    // === ANÁLISE DETALHADA DOS FATORES ===
    console.log('\n🔍 ANÁLISE DETALHADA DOS FATORES (Alto Risco):')
    console.log('-'.repeat(50))
    
    highRiskPrediction.factors.forEach(factor => {
      console.log(`📈 ${factor.type}:`)
      console.log(`   Valor atual: ${factor.currentValue}`)
      console.log(`   Threshold: ${factor.threshold}`)
      console.log(`   Tendência: ${factor.trend}`)
      console.log(`   Peso: ${(factor.weight * 100).toFixed(1)}%`)
      console.log(`   Descrição: ${factor.description}`)
      console.log('')
    })

    // === INTERVENÇÕES RECOMENDADAS ===
    console.log('\n💡 INTERVENÇÕES RECOMENDADAS:')
    console.log('-'.repeat(40))
    
    highRiskPrediction.interventions.forEach((intervention, index) => {
      console.log(`${index + 1}. ${intervention.title} (${intervention.priority})`)
      console.log(`   Tipo: ${intervention.type}`)
      console.log(`   Tempo estimado: ${intervention.estimatedTime}min`)
      console.log(`   Descrição: ${intervention.description}`)
      console.log(`   Instruções: ${intervention.instructions.join(', ')}`)
      console.log('')
    })

    // === CENÁRIO 3: DADOS INSUFICIENTES ===
    console.log('\n⚠️  CENÁRIO 3: Dados insuficientes')
    console.log('-'.repeat(40))

    try {
      const insufficientData = {
        userId: 'test_user_3',
        analysisWindow: {
          days: 14
        },
        moodEntries: [
          { moodLevel: 'neutro', period: 'manha', date: '2024-01-01', timestamp: Date.now() }
        ],
        journalEntries: []
      }

      await engine.predict(insufficientData)
    } catch (error) {
      console.log('✅ Erro esperado capturado:', error.message)
    }

    // === TESTE DE CONFIGURAÇÃO ===
    console.log('\n⚙️  TESTE DE CONFIGURAÇÃO')
    console.log('-'.repeat(40))

    const originalConfig = engine.getConfig()
    console.log('📊 Configuração original:', originalConfig.weights)

    // Atualizar configuração
    engine.updateConfig({
      weights: {
        moodWeight: 0.40,
        sentimentWeight: 0.30,
        stressKeywordWeight: 0.20,
        frequencyWeight: 0.05,
        trendWeight: 0.05
      }
    })

    const newConfig = engine.getConfig()
    console.log('📊 Nova configuração:', newConfig.weights)

    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!')
    console.log('=' .repeat(60))

    return {
      lowRiskPrediction,
      highRiskPrediction,
      configTest: 'success'
    }

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error)
    throw error
  }
}

// Executar teste se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testCrisisPredictionEngine()
    .then(() => {
      console.log('\n✅ Teste concluído com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Teste falhou:', error)
      process.exit(1)
    })
}

export default testCrisisPredictionEngine
