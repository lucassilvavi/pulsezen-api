import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'music_user_favorites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('track_id').references('id').inTable('music_tracks').onDelete('CASCADE')
      
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      
      // Evitar favoritos duplicados
      table.unique(['user_id', 'track_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
