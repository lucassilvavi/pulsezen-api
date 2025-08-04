import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'refresh_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 255).primary()
      table.uuid('user_id').notNullable()
      table.text('token_hash').notNullable()
      table.string('device_fingerprint', 500).nullable()
      table.string('user_agent', 1000).nullable()
      table.string('ip_address', 45).nullable()
      table.boolean('is_revoked').defaultTo(false)
      table.timestamp('expires_at').notNullable()
      table.timestamp('last_used_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Foreign key constraint
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      // Indexes for performance
      table.index(['user_id'])
      table.index(['token_hash'])
      table.index(['expires_at'])
      table.index(['is_revoked'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
