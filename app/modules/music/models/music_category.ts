import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import MusicTrack from './music_track.js'

export default class MusicCategory extends BaseModel {
  public static table = 'music_categories'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare icon: string | null

  @column()
  declare color: string | null

  @column()
  declare isActive: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => MusicTrack, {
    foreignKey: 'categoryId',
  })
  declare tracks: HasMany<typeof MusicTrack>
}
