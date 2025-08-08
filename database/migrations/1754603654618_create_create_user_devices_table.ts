import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_devices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable()
      table.string('fingerprint', 255).notNullable().unique()
      table.string('device_name', 100).notNullable()
      table.string('device_type', 50).notNullable() // 'mobile', 'tablet', 'desktop'
      table.string('platform', 50).notNullable() // 'ios', 'android', 'web'
      table.string('os_version', 50).nullable()
      table.string('app_version', 50).nullable()
      table.json('capabilities').notNullable() // Device biometric capabilities
      table.string('security_level', 20).notNullable() // 'premium', 'protected', 'basic', 'insecure'
      table.boolean('is_trusted').defaultTo(false)
      table.boolean('biometric_enabled').defaultTo(false)
      table.timestamp('last_seen_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Foreign keys
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      // Indexes
      table.index(['user_id'])
      table.index(['fingerprint'])
      table.index(['security_level'])
      table.index(['is_trusted'])
      table.index(['last_seen_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}