import { DateTime } from 'luxon'
// Using inline type definition to avoid import issues during testing
type SuggestionCategory = 'mindfulness' | 'anxiety' | 'self-care' | 'sleep' | 'nutrition' | 'exercise'

// Simple in-memory storage for ratings (in production this would be in database)
const ratingsStorage = new Map<string, number>();
import { StructuredLogger } from '#services/structured_logger'

// Response types
export interface DailySuggestionsResponse {
  success: boolean
  data?: {
    date: string
    suggestions: Array<{
      id: string
      title: string
      summary: string
      category: SuggestionCategory
      estimatedReadTime: number
      imageUrl: string | null
      isRead: boolean
      userSuggestionId: string
    }>
  }
  message?: string
}

export interface MarkAsReadResponse {
  success: boolean
  message: string
}

export interface RateSuggestionResponse {
  success: boolean
  message: string
}

export interface StatsResponse {
  success: boolean
  data?: {
    totalAssigned: number
    totalRead: number
    averageRating: number
    readingStreak: number
    favoriteCategory: SuggestionCategory | null
  }
  message?: string
}

export default class SuggestionService {
  /**
   * Get daily suggestions for a user (4 suggestions per day)
   */
  static async getDailySuggestions(userId: string, date?: string): Promise<DailySuggestionsResponse> {
    try {
      const targetDate = date ? DateTime.fromISO(date) : DateTime.now()
      const dateString = targetDate.toISODate()

      if (!dateString) {
        return {
          success: false,
          message: 'Data inválida fornecida'
        }
      }

      // For now, return hardcoded suggestions for testing
      const mockSuggestions = [
        {
          id: '1',
          title: 'Técnica de Respiração 4-7-8',
          summary: 'Uma técnica simples e eficaz para reduzir a ansiedade e promover o relaxamento.',
          category: 'mindfulness' as SuggestionCategory,
          estimatedReadTime: 3,
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          isRead: false,
          userSuggestionId: '1'
        },
        {
          id: '2',
          title: 'Técnica de Aterramento 5-4-3-2-1',
          summary: 'Use seus sentidos para se reconectar com o presente e reduzir a ansiedade.',
          category: 'anxiety' as SuggestionCategory,
          estimatedReadTime: 3,
          imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
          isRead: false,
          userSuggestionId: '2'
        },
        {
          id: '3',
          title: 'Exercícios de Alongamento',
          summary: 'Movimentos simples que liberam tensão física e reduzem o estresse.',
          category: 'anxiety' as SuggestionCategory,
          estimatedReadTime: 4,
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          isRead: false,
          userSuggestionId: '3'
        },
        {
          id: '4',
          title: 'Alimentos que Combatem a Ansiedade',
          summary: 'Descubra como sua alimentação pode ser uma aliada no controle da ansiedade.',
          category: 'self-care' as SuggestionCategory,
          estimatedReadTime: 4,
          imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
          isRead: false,
          userSuggestionId: '4'
        }
      ]

      StructuredLogger.info('Daily suggestions generated successfully (mock data)', {
        userId,
        date: dateString,
        suggestionsCount: mockSuggestions.length
      })

      return {
        success: true,
        data: {
          date: dateString,
          suggestions: mockSuggestions
        }
      }
    } catch (error) {
      StructuredLogger.error('Error retrieving daily suggestions', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }

  /**
   * Get a specific suggestion by ID (mock implementation for testing)
   */
  static async getSuggestionById(suggestionId: string, _userId: string): Promise<{
    success: boolean
    data?: {
      id: string
      title: string
      content: string
      summary: string
      category: SuggestionCategory
      estimatedReadTime: number
      imageUrl: string | null
      isRead: boolean
      userSuggestionId: string
      rating?: number
    }
    message?: string
  }> {
    try {
      // Mock suggestion details
      const mockSuggestionDetails: { [key: string]: any } = {
        '1': {
          id: '1',
          title: 'Técnica de Respiração 4-7-8',
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
          summary: 'Uma técnica simples e eficaz para reduzir a ansiedade e promover o relaxamento.',
          category: 'mindfulness' as SuggestionCategory,
          estimatedReadTime: 3,
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          isRead: false,
          userSuggestionId: '1',
          rating: null
        },
        '2': {
          id: '2',
          title: 'Técnica de Aterramento 5-4-3-2-1',
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
          summary: 'Use seus sentidos para se reconectar com o presente e reduzir a ansiedade.',
          category: 'anxiety' as SuggestionCategory,
          estimatedReadTime: 3,
          imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
          isRead: false,
          userSuggestionId: '2',
          rating: null
        },
        '3': {
          id: '3',
          title: 'Exercícios de Alongamento',
          content: `# Exercícios de Alongamento para Reduzir a Ansiedade

O alongamento é uma forma natural e eficaz de liberar a tensão física acumulada pelo estresse e ansiedade.

## Benefícios:
- Reduz tensão muscular
- Melhora a circulação
- Diminui o cortisol (hormônio do estresse)
- Promove relaxamento mental

## Exercícios (faça 2-3 séries, segure por 30 segundos):

### 1. Alongamento do Pescoço
- Incline a cabeça para o lado direito
- Coloque a mão direita sobre a orelha esquerda
- Puxe gentilmente
- Repita do outro lado

### 2. Alongamento dos Ombros
- Leve o braço direito sobre o peito
- Use o braço esquerdo para puxar o cotovelo
- Sinta o alongamento no ombro
- Repita com o outro braço

### 3. Torção da Coluna
- Sentado, gire o tronco para a direita
- Coloque a mão esquerda no joelho direito
- Olhe por cima do ombro direito
- Repita para o outro lado

### 4. Alongamento das Costas
- De pé, entrelace os dedos
- Estenda os braços à frente
- Curve as costas como um gato
- Respire profundamente

**Pratique sempre que sentir tensão acumulada.**`,
          summary: 'Movimentos simples que liberam tensão física e reduzem o estresse.',
          category: 'anxiety' as SuggestionCategory,
          estimatedReadTime: 4,
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          isRead: false,
          userSuggestionId: '3',
          rating: null
        },
        '4': {
          id: '4',
          title: 'Alimentos que Combatem a Ansiedade',
          content: `# Alimentos que Combatem a Ansiedade

A alimentação tem um papel fundamental no controle da ansiedade. Alguns alimentos podem ajudar a regular os neurotransmissores e reduzir os sintomas.

## Alimentos Calmantes:

### 🐟 Peixes Ricos em Ômega-3
- Salmão, sardinha, atum
- Reduzem inflamação e estresse
- Melhoram função cerebral

### 🥬 Vegetais Verde-Escuros
- Espinafre, couve, brócolis
- Ricos em magnésio
- Relaxam músculos e nervos

### 🫐 Frutas Vermelhas
- Blueberry, framboesa, morango
- Antioxidantes que protegem o cérebro
- Regulam cortisol

### 🥜 Nozes e Sementes
- Amêndoas, castanhas, sementes de abóbora
- Magnésio e triptofano
- Promovem produção de serotonina

### 🍵 Chás Calmantes
- Camomila, melissa, valeriana
- Propriedades relaxantes naturais
- Substituem cafeína

## Evite:
- Cafeína em excesso
- Açúcar refinado
- Álcool
- Alimentos processados

## Dica Prática:
Faça um lanche calmante: iogurte com frutas vermelhas e nozes.

**Lembre-se: pequenas mudanças na alimentação podem ter grandes impactos no seu bem-estar emocional.**`,
          summary: 'Descubra como sua alimentação pode ser uma aliada no controle da ansiedade.',
          category: 'self-care' as SuggestionCategory,
          estimatedReadTime: 4,
          imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
          isRead: false,
          userSuggestionId: '4',
          rating: null
        }
      }

      const suggestionDetail = mockSuggestionDetails[suggestionId]
      
      if (!suggestionDetail) {
        return {
          success: false,
          message: 'Sugestão não encontrada'
        }
      }

      // Check if there's a stored rating for this user suggestion
      const storedRating = ratingsStorage.get(suggestionDetail.userSuggestionId)
      
      return {
        success: true,
        data: {
          ...suggestionDetail,
          rating: storedRating || null
        }
      }
    } catch (error) {
      StructuredLogger.error('Error retrieving suggestion', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }

  /**
   * Mark suggestion as read (mock implementation)
   */
  static async markAsRead(userSuggestionId: string, userId: string): Promise<MarkAsReadResponse> {
    try {
      StructuredLogger.info('Suggestion marked as read (mock)', {
        userSuggestionId,
        userId
      })

      return {
        success: true,
        message: 'Sugestão marcada como lida'
      }
    } catch (error) {
      StructuredLogger.error('Error marking suggestion as read', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }

  /**
   * Rate a suggestion (mock implementation)
   */
  static async rateSuggestion(userSuggestionId: string, userId: string, rating: number): Promise<RateSuggestionResponse> {
    try {
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          message: 'Avaliação deve estar entre 1 e 5'
        }
      }

      // Store the rating in memory (in production this would be saved to database)
      ratingsStorage.set(userSuggestionId, rating)

      StructuredLogger.info('Suggestion rated (mock)', {
        userSuggestionId,
        userId,
        rating
      })

      return {
        success: true,
        message: 'Avaliação registrada com sucesso'
      }
    } catch (error) {
      StructuredLogger.error('Error rating suggestion', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }

  /**
   * Get user suggestion statistics (mock implementation)
   */
  static async getStats(userId: string): Promise<StatsResponse> {
    try {
      StructuredLogger.info('Getting suggestion stats (mock)', { userId })

      return {
        success: true,
        data: {
          totalAssigned: 12,
          totalRead: 8,
          averageRating: 4.2,
          readingStreak: 3,
          favoriteCategory: 'mindfulness'
        }
      }
    } catch (error) {
      StructuredLogger.error('Error getting suggestion stats', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }
}