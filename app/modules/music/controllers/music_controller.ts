import type { HttpContext } from '@adonisjs/core/http'
import musicService, { CreatePlaylistData, UpdatePlaylistData } from '../services/music_service.js'

export default class MusicController {
  /**
   * GET /music/categories
   * Buscar todas as categorias de música
   */
  async getCategories({ response }: HttpContext) {
    try {
      console.log('[Music Controller] 📚 GET /music/categories')
      
      const categories = await musicService.getCategories()
      
      return response.ok({
        success: true,
        data: categories,
        message: 'Categories fetched successfully'
      })
    } catch (error) {
      console.error('[Music Controller] ❌ Error fetching categories:', error)
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      })
    }
  }

  /**
   * GET /music/categories/:id
   * Buscar categoria específica
   */
  async getCategoryById({ params, response }: HttpContext) {
    try {
      console.log(`[Music Controller] 🔍 GET /music/categories/${params.id}`)
      
      const category = await musicService.getCategoryById(params.id)
      
      return response.ok({
        success: true,
        data: category,
        message: 'Category fetched successfully'
      })
    } catch (error) {
      console.error(`[Music Controller] ❌ Error fetching category ${params.id}:`, error)
      
      if (error.status === 404) {
        return response.notFound({
          success: false,
          message: 'Category not found'
        })
      }
      
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch category',
        error: error.message
      })
    }
  }

  /**
   * GET /music/tracks
   * Buscar todas as tracks
   */
  async getTracks({ response }: HttpContext) {
    try {
      console.log('[Music Controller] 🎵 GET /music/tracks')
      
      const tracks = await musicService.getTracks()
      
      return response.ok({
        success: true,
        data: tracks,
        message: 'Tracks fetched successfully'
      })
    } catch (error) {
      console.error('[Music Controller] ❌ Error fetching tracks:', error)
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch tracks',
        error: error.message
      })
    }
  }

  /**
   * GET /music/tracks/:id
   * Buscar track específica
   */
  async getTrackById({ params, response }: HttpContext) {
    try {
      console.log(`[Music Controller] 🔍 GET /music/tracks/${params.id}`)
      
      const track = await musicService.getTrackById(params.id)
      
      return response.ok({
        success: true,
        data: track,
        message: 'Track fetched successfully'
      })
    } catch (error) {
      console.error(`[Music Controller] ❌ Error fetching track ${params.id}:`, error)
      
      if (error.status === 404) {
        return response.notFound({
          success: false,
          message: 'Track not found'
        })
      }
      
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch track',
        error: error.message
      })
    }
  }

  /**
   * GET /music/playlists
   * Buscar playlists do usuário autenticado
   */
  async getPlaylists({ auth, response }: HttpContext) {
    try {
      console.log('[Music Controller] 📚 GET /music/playlists')
      
      if (!auth) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }

      const playlists = await musicService.getUserPlaylists(auth.userId)
      
      return response.ok({
        success: true,
        data: playlists,
        message: 'Playlists fetched successfully'
      })
    } catch (error) {
      console.error('[Music Controller] ❌ Error fetching playlists:', error)
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch playlists',
        error: error.message
      })
    }
  }

  /**
   * POST /music/playlists
   * Criar nova playlist
   */
  async createPlaylist({ auth, request, response }: HttpContext) {
    try {
      console.log('[Music Controller] ➕ POST /music/playlists')
      
      if (!auth) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }

      const data = request.only(['name', 'description', 'isPublic', 'trackIds']) as CreatePlaylistData
      
      console.log('[Music Controller] 📋 Request data:', data)
      
      // Validar campos obrigatórios
      if (!data.name || data.name.trim() === '') {
        return response.badRequest({
          success: false,
          message: 'Playlist name is required'
        })
      }
      
      const playlist = await musicService.createPlaylist(auth.userId, data)
      
      return response.created({
        success: true,
        data: playlist,
        message: 'Playlist created successfully'
      })
    } catch (error) {
      console.error('[Music Controller] ❌ Error creating playlist:', error)
      return response.internalServerError({
        success: false,
        message: 'Failed to create playlist',
        error: error.message
      })
    }
  }

  /**
   * PUT /music/playlists/:id
   * Atualizar playlist
   */
  async updatePlaylist({ auth, params, request, response }: HttpContext) {
    try {
      console.log(`[Music Controller] ✏️ PUT /music/playlists/${params.id}`)
      
      if (!auth) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }

      const data = request.only(['name', 'description', 'isPublic']) as UpdatePlaylistData
      
      const playlist = await musicService.updatePlaylist(params.id, auth.userId, data)
      
      return response.ok({
        success: true,
        data: playlist,
        message: 'Playlist updated successfully'
      })
    } catch (error) {
      console.error(`[Music Controller] ❌ Error updating playlist ${params.id}:`, error)
      
      if (error.status === 404) {
        return response.notFound({
          success: false,
          message: 'Playlist not found'
        })
      }
      
      return response.internalServerError({
        success: false,
        message: 'Failed to update playlist',
        error: error.message
      })
    }
  }

  /**
   * DELETE /music/playlists/:id
   * Deletar playlist
   */
  async deletePlaylist({ auth, params, response }: HttpContext) {
    try {
      console.log(`[Music Controller] 🗑️ DELETE /music/playlists/${params.id}`)
      
      if (!auth) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }

      await musicService.deletePlaylist(params.id, auth.userId)
      
      return response.ok({
        success: true,
        message: 'Playlist deleted successfully'
      })
    } catch (error) {
      console.error(`[Music Controller] ❌ Error deleting playlist ${params.id}:`, error)
      
      if (error.status === 404) {
        return response.notFound({
          success: false,
          message: 'Playlist not found'
        })
      }
      
      return response.internalServerError({
        success: false,
        message: 'Failed to delete playlist',
        error: error.message
      })
    }
  }

  /**
   * POST /music/playlists/:id/tracks
   * Adicionar tracks à playlist
   */
  async addTracksToPlaylist({ params, request, response }: HttpContext) {
    try {
      console.log(`[Music Controller] ➕ POST /music/playlists/${params.id}/tracks`)
      
      const { trackIds } = request.only(['trackIds'])
      
      if (!Array.isArray(trackIds)) {
        return response.badRequest({
          success: false,
          message: 'trackIds must be an array'
        })
      }
      
      await musicService.addTracksToPlaylist(params.id, trackIds)
      
      return response.ok({
        success: true,
        message: 'Tracks added to playlist successfully'
      })
    } catch (error) {
      console.error(`[Music Controller] ❌ Error adding tracks to playlist ${params.id}:`, error)
      
      if (error.status === 404) {
        return response.notFound({
          success: false,
          message: error.message
        })
      }
      
      return response.internalServerError({
        success: false,
        message: 'Failed to add tracks to playlist',
        error: error.message
      })
    }
  }

  /**
   * DELETE /music/playlists/:id/tracks
   * Remover tracks da playlist
   */
  async removeTracksFromPlaylist({ params, request, response }: HttpContext) {
    try {
      console.log(`[Music Controller] ➖ DELETE /music/playlists/${params.id}/tracks`)
      
      const { trackIds } = request.only(['trackIds'])
      
      if (!Array.isArray(trackIds)) {
        return response.badRequest({
          success: false,
          message: 'trackIds must be an array'
        })
      }
      
      await musicService.removeTracksFromPlaylist(params.id, trackIds)
      
      return response.ok({
        success: true,
        message: 'Tracks removed from playlist successfully'
      })
    } catch (error) {
      console.error(`[Music Controller] ❌ Error removing tracks from playlist ${params.id}:`, error)
      
      if (error.status === 404) {
        return response.notFound({
          success: false,
          message: 'Playlist not found'
        })
      }
      
      return response.internalServerError({
        success: false,
        message: 'Failed to remove tracks from playlist',
        error: error.message
      })
    }
  }

  /**
   * POST /music/favorites/toggle/:trackId
   * Favoritar/desfavoritar track
   */
  async toggleFavorite({ auth, params, response }: HttpContext) {
    try {
      console.log('[Music Controller] ❤️ POST /music/favorites/toggle')
      
      const { trackId } = params
      
      if (!trackId) {
        return response.badRequest({
          success: false,
          message: 'trackId is required'
        })
      }
      
      const result = await musicService.toggleFavorite(auth!.userId, trackId)
      
      return response.ok({
        success: true,
        data: result,
        message: result.isFavorite ? 'Track favorited' : 'Track unfavorited'
      })
    } catch (error) {
      console.error('[Music Controller] ❌ Error toggling favorite:', error)
      
      if (error.status === 404) {
        return response.notFound({
          success: false,
          message: error.message
        })
      }
      
      return response.internalServerError({
        success: false,
        message: 'Failed to toggle favorite',
        error: error.message
      })
    }
  }

  /**
   * GET /music/favorites
   * Buscar tracks favoritas do usuário
   */
  async getFavorites({ auth, response }: HttpContext) {
    try {
      console.log('[Music Controller] ❤️ GET /music/favorites')
      
      if (!auth) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }
      
      const tracks = await musicService.getFavoriteTracks(auth.userId)
      
      return response.ok({
        success: true,
        data: tracks,
        message: 'Favorite tracks fetched successfully'
      })
    } catch (error) {
      console.error('[Music Controller] ❌ Error fetching favorites:', error)
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch favorite tracks',
        error: error.message
      })
    }
  }
}