import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_suggestions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.string('id').primary()
      
      // Foreign keys
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.string('suggestion_id').references('id').inTable('suggestions').onDelete('CASCADE').notNullable()
      
      // Assignment fields
      table.date('assigned_date').notNullable() // Date when suggestion was assigned
      table.boolean('is_read').notNullable().defaultTo(false)
      table.timestamp('read_at', { useTz: true }).nullable()
      table.integer('rating').nullable().checkIn(['1', '2', '3', '4', '5']) // User rating 1-5
      
      // Audit fields
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Indexes for performance
      table.index(['user_id'])
      table.index(['assigned_date'])
      table.index(['is_read'])
      table.index(['user_id', 'assigned_date'])
      table.index(['user_id', 'is_read'])
      
      // Unique constraint: one assignment per user per suggestion per day
      table.unique(['user_id', 'suggestion_id', 'assigned_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}