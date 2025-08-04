import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'music_playlist_tracks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('playlist_id').references('id').inTable('music_playlists').onDelete('CASCADE')
      table.string('track_id').references('id').inTable('music_tracks').onDelete('CASCADE')
      table.integer('sort_order').defaultTo(0)
      
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      
      // Evitar tracks duplicadas na mesma playlist
      table.unique(['playlist_id', 'track_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
