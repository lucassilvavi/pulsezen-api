import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'breathing_techniques'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('name').notNullable()
      table.text('description').nullable()
      table.string('icon').nullable()
      table.string('color').nullable()
      table.integer('duration').notNullable() // em segundos
      table.json('steps').nullable() // passos da técnica
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