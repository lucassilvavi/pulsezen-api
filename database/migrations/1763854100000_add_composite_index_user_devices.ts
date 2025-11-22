import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_devices'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Índice composto para otimizar a query de autenticação biométrica
      // Cobre: WHERE fingerprint = ? AND biometric_enabled = true
      table.index(['fingerprint', 'biometric_enabled', 'user_id'], 'idx_device_auth_lookup')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['fingerprint', 'biometric_enabled', 'user_id'], 'idx_device_auth_lookup')
    })
  }
}
