import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'biometric_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable()
      table.uuid('device_id').notNullable()
      table.string('token_hash', 255).notNullable()
      table.string('biometric_type', 50).notNullable() // 'faceId', 'touchId', 'fingerprint', 'iris'
      table.json('biometric_data').nullable() // Encrypted biometric reference data
      table.integer('challenge_attempts').defaultTo(0)
      table.integer('success_count').defaultTo(0)
      table.timestamp('last_used_at', { useTz: true }).nullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Foreign keys
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('device_id').references('id').inTable('user_devices').onDelete('CASCADE')
      
      // Indexes
      table.index(['user_id'])
      table.index(['device_id'])
      table.index(['token_hash'])
      table.index(['biometric_type'])
      table.index(['is_active'])
      table.index(['expires_at'])
      table.index(['last_used_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}