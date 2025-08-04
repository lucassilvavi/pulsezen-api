import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'music_playlists'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('name').notNullable()
      table.text('description').nullable()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.boolean('is_public').defaultTo(false)
      table.boolean('is_system').defaultTo(false) // playlists do sistema (não podem ser deletadas)
      
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
