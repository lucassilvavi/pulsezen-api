import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mood_statistics'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.string('id').primary()
      
      // Foreign key to users
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable()
      
      // Date this statistic represents
      table.date('date').notNullable()
      
      // Aggregated stats
      table.decimal('average_mood', 3, 2).notNullable() // 1.00 to 5.00
      table.integer('total_entries').defaultTo(0)
      
      // JSON fields for detailed distributions
      table.json('period_distribution').nullable() // {manha: 2, tarde: 1, noite: 0}
      table.json('mood_distribution').nullable() // {excelente: 1, bem: 2, neutro: 0, mal: 0, pessimo: 0}
      
      // Audit fields
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Indexes
      table.index(['user_id'])
      table.index(['date'])
      table.index(['user_id', 'date'])
      
      // Unique constraint: one statistic per user per date
      table.unique(['user_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}