import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable()
      table.uuid('device_id').nullable()
      table.string('auth_method', 50).notNullable() // 'biometric', 'devicePin', 'appPin', 'email', 'sms'
      table.string('biometric_type', 50).nullable() // Tipo específico de biometria usado
      table.string('result', 20).notNullable() // 'success', 'failed', 'fallback', 'blocked'
      table.string('failure_reason', 100).nullable() // Motivo da falha se aplicável
      table.string('ip_address', 45).nullable()
      table.string('user_agent', 500).nullable()
      table.json('geolocation').nullable() // Dados de localização se disponíveis
      table.json('device_info').nullable() // Informações extras do device
      table.decimal('trust_score_at_time', 5, 2).nullable() // Trust score no momento do auth
      table.integer('response_time_ms').nullable() // Tempo de resposta da autenticação
      table.boolean('required_fallback').defaultTo(false) // Se precisou usar fallback
      table.timestamp('attempted_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      
      // Foreign keys
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('device_id').references('id').inTable('user_devices').onDelete('SET NULL')
      
      // Indexes
      table.index(['user_id'])
      table.index(['device_id'])
      table.index(['auth_method'])
      table.index(['result'])
      table.index(['attempted_at'])
      table.index(['ip_address'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}