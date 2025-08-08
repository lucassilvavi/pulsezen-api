import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_trust_scores'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('device_id').notNullable()
      table.decimal('base_score', 5, 2).defaultTo(50.00) // Score base do device
      table.decimal('behavior_score', 5, 2).defaultTo(50.00) // Score baseado no comportamento
      table.decimal('location_score', 5, 2).defaultTo(50.00) // Score baseado na localização
      table.decimal('time_score', 5, 2).defaultTo(50.00) // Score baseado nos horários de uso
      table.decimal('final_score', 5, 2).defaultTo(50.00) // Score final calculado
      table.integer('login_frequency').defaultTo(0) // Frequência de logins
      table.integer('successful_auths').defaultTo(0) // Autenticações bem-sucedidas
      table.integer('failed_auths').defaultTo(0) // Autenticações falhadas
      table.json('location_history').nullable() // Histórico de localizações (IP/geo)
      table.json('usage_patterns').nullable() // Padrões de uso do usuário
      table.timestamp('last_calculated_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Foreign keys
      table.foreign('device_id').references('id').inTable('user_devices').onDelete('CASCADE')
      
      // Indexes
      table.index(['device_id'])
      table.index(['final_score'])
      table.index(['last_calculated_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}