import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import MusicCategory from './music_category.js'
import MusicPlaylist from './music_playlist.js'

export default class MusicTrack extends BaseModel {
  public static table = 'music_tracks'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare artist: string | null

  @column()
  declare categoryId: string

  @column()
  declare duration: number

  @column()
  declare durationFormatted: string

  @column()
  declare filePath: string | null

  @column()
  declare fileUrl: string | null

  @column()
  declare icon: string | null

  @column()
  declare description: string | null

  @column()
  declare isActive: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => MusicCategory, {
    foreignKey: 'categoryId',
  })
  declare category: BelongsTo<typeof MusicCategory>

  @manyToMany(() => MusicPlaylist, {
    pivotTable: 'music_playlist_tracks',
    localKey: 'id',
    pivotForeignKey: 'track_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'playlist_id',
    pivotColumns: ['sort_order'],
  })
  declare playlists: ManyToMany<typeof MusicPlaylist>

  // User favorite relationship is handled via service layer to avoid circular dependencies
}
