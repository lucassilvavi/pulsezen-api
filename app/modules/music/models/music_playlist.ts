import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import MusicTrack from './music_track.js'

export default class MusicPlaylist extends BaseModel {
  public static table = 'music_playlists'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare userId: string

  @column()
  declare isPublic: boolean

  @column()
  declare isSystem: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // User relationship is handled via service layer to avoid circular dependencies
  // @belongsTo(() => User, {
  //   foreignKey: 'userId',
  // })
  // declare user: BelongsTo<typeof User>

  @manyToMany(() => MusicTrack, {
    pivotTable: 'music_playlist_tracks',
    localKey: 'id',
    pivotForeignKey: 'playlist_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'track_id',
    pivotColumns: ['sort_order'],
  })
  declare tracks: ManyToMany<typeof MusicTrack>
}
