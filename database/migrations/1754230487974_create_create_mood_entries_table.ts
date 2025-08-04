import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mood_entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.string('id').primary()
      
      // Foreign key to users
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable()
      
      // Core mood fields
      table.enum('mood_level', ['excelente', 'bem', 'neutro', 'mal', 'pessimo']).notNullable()
      table.enum('period', ['manha', 'tarde', 'noite']).notNullable()
      table.date('date').notNullable() // YYYY-MM-DD format
      table.bigInteger('timestamp').notNullable() // Unix timestamp for precise ordering
      
      // Optional fields
      table.text('notes').nullable() // User notes about their mood
      table.json('activities').nullable() // Array of activities during this period
      table.json('emotions').nullable() // Array of emotions felt
      
      // Audit fields
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Indexes for performance
      table.index(['user_id']) // Most queries will filter by user
      table.index(['date']) // Date range queries
      table.index(['period']) // Period-specific queries
      table.index(['mood_level']) // Stats queries by mood
      table.index(['user_id', 'date']) // Combined queries
      table.index(['user_id', 'date', 'period']) // Uniqueness check queries
      
      // Unique constraint: one entry per user per date per period
      table.unique(['user_id', 'date', 'period'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}