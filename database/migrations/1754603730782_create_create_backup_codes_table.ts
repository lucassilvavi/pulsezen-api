import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'backup_codes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable()
      table.string('code_hash', 255).notNullable() // Hash do código de backup
      table.string('code_partial', 10).notNullable() // Parte visível do código (para UI)
      table.boolean('is_used').defaultTo(false)
      table.timestamp('used_at', { useTz: true }).nullable()
      table.string('used_from_ip', 45).nullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Foreign keys
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      // Indexes
      table.index(['user_id'])
      table.index(['code_hash'])
      table.index(['is_used'])
      table.index(['expires_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}