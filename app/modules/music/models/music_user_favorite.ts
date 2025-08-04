import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '../../../models/user.js'
import MusicTrack from './music_track.js'

export default class MusicUserFavorite extends BaseModel {
  static table = 'music_user_favorites'
  
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare trackId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => MusicTrack, {
    foreignKey: 'trackId',
  })
  declare track: BelongsTo<typeof MusicTrack>
}
