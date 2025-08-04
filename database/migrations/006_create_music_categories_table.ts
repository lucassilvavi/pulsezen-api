import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'music_categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('icon').nullable()
      table.string('color').nullable()
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
