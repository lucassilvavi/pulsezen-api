import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'music_tracks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('title').notNullable()
      table.string('artist').nullable()
      table.string('category_id').references('id').inTable('music_categories').onDelete('CASCADE')
      table.integer('duration').notNullable() // em segundos
      table.string('duration_formatted').notNullable() // formato MM:SS
      table.string('file_path').nullable() // caminho do arquivo de áudio
      table.string('file_url').nullable() // URL do arquivo (se hospedado externamente)
      table.string('icon').nullable()
      table.text('description').nullable()
      table.boolean('is_active').defaultTo(true)
      table.integer('sort_order').defaultTo(0)
      
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
