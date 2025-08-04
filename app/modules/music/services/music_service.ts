import MusicCategory from '../models/music_category.js'
import MusicTrack from '../models/music_track.js'
import MusicPlaylist from '../models/music_playlist.js'
import MusicUserFavorite from '../models/music_user_favorite.js'
import { Exception } from '@adonisjs/core/exceptions'

export interface CreatePlaylistData {
  name: string
  description?: string
  isPublic?: boolean
  trackIds?: string[]
}

export interface UpdatePlaylistData {
  name?: string
  description?: string
  isPublic?: boolean
}

export interface PlaylistResponse {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  isSystem: boolean
  createdAt: string
  updatedAt: string
  tracks: TrackResponse[]
}

export interface TrackResponse {
  id: string
  title: string
  artist: string | null
  duration: number
  durationFormatted: string
  filePath: string | null
  fileUrl: string | null
  icon: string | null
  description: string | null
  category: {
    id: string
    title: string
    icon: string | null
    color: string | null
  }
}

export interface CategoryResponse {
  id: string
  title: string
  description: string | null
  icon: string | null
  color: string | null
  tracks: TrackResponse[]
}

export class MusicService {
  /**
   * Buscar todas as categorias com suas tracks
   */
  async getCategories(): Promise<CategoryResponse[]> {
    console.log('[Music Service] 🎵 Fetching all music categories...')
    
    const categories = await MusicCategory.query()
      .where('isActive', true)
      .preload('tracks', (query) => {
        query.where('isActive', true).orderBy('sortOrder', 'asc')
      })
      .orderBy('sortOrder', 'asc')

    console.log(`[Music Service] ✅ Found ${categories.length} categories`)

    return categories.map(category => ({
      id: category.id,
      title: category.title,
      description: category.description,
      icon: category.icon,
      color: category.color,
      tracks: category.tracks.map(track => this.formatTrack(track, category))
    }))
  }

  /**
   * Buscar categoria específica por ID
   */
  async getCategoryById(id: string): Promise<CategoryResponse> {
    console.log(`[Music Service] 🔍 Fetching category: ${id}`)
    
    const category = await MusicCategory.query()
      .where('id', id)
      .where('isActive', true)
      .preload('tracks', (query) => {
        query.where('isActive', true).orderBy('sortOrder', 'asc')
      })
      .first()

    if (!category) {
      throw new Exception(`Category ${id} not found`, { status: 404 })
    }

    console.log(`[Music Service] ✅ Found category: ${category.title}`)

    return {
      id: category.id,
      title: category.title,
      description: category.description,
      icon: category.icon,
      color: category.color,
      tracks: category.tracks.map(track => this.formatTrack(track, category))
    }
  }

  /**
   * Buscar todas as tracks
   */
  async getTracks(): Promise<TrackResponse[]> {
    console.log('[Music Service] 🎵 Fetching all music tracks...')
    
    const tracks = await MusicTrack.query()
      .where('isActive', true)
      .preload('category')
      .orderBy('sortOrder', 'asc')

    console.log(`[Music Service] ✅ Found ${tracks.length} tracks`)

    return tracks.map(track => this.formatTrack(track, track.category))
  }

  /**
   * Buscar track específica por ID
   */
  async getTrackById(id: string): Promise<TrackResponse> {
    console.log(`[Music Service] 🔍 Fetching track: ${id}`)
    
    const track = await MusicTrack.query()
      .where('id', id)
      .where('isActive', true)
      .preload('category')
      .first()

    if (!track) {
      throw new Exception(`Track ${id} not found`, { status: 404 })
    }

    console.log(`[Music Service] ✅ Found track: ${track.title}`)

    return this.formatTrack(track, track.category)
  }

  /**
   * Buscar playlists do usuário
   */
  async getUserPlaylists(userId: string): Promise<PlaylistResponse[]> {
    console.log(`[Music Service] 📚 Fetching playlists for user: ${userId}`)
    
    const playlists = await MusicPlaylist.query()
      .where('userId', userId)
      .preload('tracks', (query) => {
        query.where('isActive', true).orderBy('pivot_sort_order', 'asc')
      })
      .orderBy('createdAt', 'desc')

    console.log(`[Music Service] ✅ Found ${playlists.length} playlists`)

    return playlists.map(playlist => this.formatPlaylist(playlist))
  }

  /**
   * Criar nova playlist
   */
  async createPlaylist(userId: string, data: CreatePlaylistData): Promise<PlaylistResponse> {
    console.log(`[Music Service] ➕ Creating playlist: ${data.name}`)
    
    const playlist = await MusicPlaylist.create({
      userId,
      name: data.name,
      description: data.description || null,
      isPublic: data.isPublic || false,
      isSystem: false,
    })

    // Adicionar tracks se fornecidas
    if (data.trackIds && data.trackIds.length > 0) {
      await this.addTracksToPlaylist(playlist.id, data.trackIds)
    }

    await playlist.load('tracks')
    
    console.log(`[Music Service] ✅ Playlist created: ${playlist.name}`)

    return this.formatPlaylist(playlist)
  }

  /**
   * Atualizar playlist
   */
  async updatePlaylist(playlistId: string, userId: string, data: UpdatePlaylistData): Promise<PlaylistResponse> {
    console.log(`[Music Service] ✏️ Updating playlist: ${playlistId}`)
    
    const playlist = await MusicPlaylist.query()
      .where('id', playlistId)
      .where('userId', userId)
      .first()

    if (!playlist) {
      throw new Exception('Playlist not found', { status: 404 })
    }

    playlist.merge(data)
    await playlist.save()
    await playlist.load('tracks')

    console.log(`[Music Service] ✅ Playlist updated: ${playlist.name}`)

    return this.formatPlaylist(playlist)
  }

  /**
   * Deletar playlist
   */
  async deletePlaylist(playlistId: string, userId: string): Promise<void> {
    console.log(`[Music Service] 🗑️ Deleting playlist: ${playlistId}`)
    
    const playlist = await MusicPlaylist.query()
      .where('id', playlistId)
      .where('userId', userId)
      .where('isSystem', false) // Não permitir deletar playlists do sistema
      .first()

    if (!playlist) {
      throw new Exception('Playlist not found', { status: 404 })
    }

    await playlist.delete()
    
    console.log(`[Music Service] ✅ Playlist deleted: ${playlistId}`)
  }

  /**
   * Adicionar tracks à playlist
   */
  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    console.log(`[Music Service] ➕ Adding ${trackIds.length} tracks to playlist: ${playlistId}`)
    
    const playlist = await MusicPlaylist.find(playlistId)
    if (!playlist) {
      throw new Exception('Playlist not found', { status: 404 })
    }

    // Verificar se as tracks existem
    const tracks = await MusicTrack.query().whereIn('id', trackIds)
    if (tracks.length !== trackIds.length) {
      throw new Exception('Some tracks not found', { status: 404 })
    }

    // Adicionar tracks com sort_order baseado na ordem atual
    const currentTracks = await playlist.related('tracks').query()
    const startOrder = currentTracks.length

    for (let i = 0; i < trackIds.length; i++) {
      await playlist.related('tracks').attach({
        [trackIds[i]]: { sort_order: startOrder + i }
      })
    }

    console.log(`[Music Service] ✅ Tracks added to playlist`)
  }

  /**
   * Remover tracks da playlist
   */
  async removeTracksFromPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    console.log(`[Music Service] ➖ Removing ${trackIds.length} tracks from playlist: ${playlistId}`)
    
    const playlist = await MusicPlaylist.find(playlistId)
    if (!playlist) {
      throw new Exception('Playlist not found', { status: 404 })
    }

    await playlist.related('tracks').detach(trackIds)
    
    console.log(`[Music Service] ✅ Tracks removed from playlist`)
  }

  /**
   * Favoritar/desfavoritar track
   */
  async toggleFavorite(userId: string, trackId: string): Promise<{ isFavorite: boolean }> {
    console.log(`[Music Service] ❤️ Toggling favorite for track: ${trackId}`)
    
    // Verificar se a track existe
    const track = await MusicTrack.find(trackId)
    if (!track) {
      throw new Exception(`Track ${trackId} not found`, { status: 404 })
    }

    // Verificar se já é favorito
    const existingFavorite = await MusicUserFavorite.query()
      .where('userId', userId)
      .where('trackId', trackId)
      .first()

    if (existingFavorite) {
      // Remove dos favoritos
      await existingFavorite.delete()
      console.log(`[Music Service] ❤️ Removed track from favorites: ${trackId}`)
      return { isFavorite: false }
    } else {
      // Adiciona aos favoritos
      await MusicUserFavorite.create({
        userId,
        trackId,
      })
      console.log(`[Music Service] ❤️ Added track to favorites: ${trackId}`)
      return { isFavorite: true }
    }
  }

  /**
   * Buscar tracks favoritas do usuário
   */
  async getFavoriteTracks(userId: string): Promise<TrackResponse[]> {
    console.log(`[Music Service] ❤️ Fetching favorite tracks for user: ${userId}`)
    
    // Buscar as tracks favoritas do usuário
    const favorites = await MusicUserFavorite.query()
      .where('userId', userId)
      .preload('track', (query) => {
        query.where('isActive', true).preload('category')
      })
      .orderBy('createdAt', 'desc')

    console.log(`[Music Service] ✅ Found ${favorites.length} favorite tracks`)

    return favorites
      .filter(favorite => favorite.track) // Filtrar tracks que ainda existem
      .map(favorite => this.formatTrack(favorite.track, favorite.track.category))
  }

  /**
   * Formatar track para resposta
   */
  private formatTrack(track: MusicTrack, category: MusicCategory): TrackResponse {
    return {
      id: track.id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      durationFormatted: track.durationFormatted,
      filePath: track.filePath,
      fileUrl: track.fileUrl,
      icon: track.icon,
      description: track.description,
      category: {
        id: category.id,
        title: category.title,
        icon: category.icon,
        color: category.color
      }
    }
  }

  /**
   * Formatar playlist para resposta
   */
  private formatPlaylist(playlist: MusicPlaylist): PlaylistResponse {
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      isPublic: playlist.isPublic,
      isSystem: playlist.isSystem,
      createdAt: playlist.createdAt.toISO() || '',
      updatedAt: playlist.updatedAt.toISO() || '',
      tracks: playlist.tracks.map(track => this.formatTrack(track, track.category))
    }
  }
}

export default new MusicService()
