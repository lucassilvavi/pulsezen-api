import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'breathing_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('technique_id').references('id').inTable('breathing_techniques').onDelete('CASCADE')
      table.integer('duration').notNullable() // em segundos
      table.timestamp('started_at').notNullable()
      table.timestamp('completed_at').nullable()
      table.boolean('completed').defaultTo(false)
      table.json('metadata').nullable() // dados adicionais da sessão
      
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}