import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('email').unique().notNullable()
      table.string('password_hash').notNullable()
      table.boolean('email_verified').defaultTo(false)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      
      // Indexes
      table.index(['email'])
      table.index(['email_verified'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
