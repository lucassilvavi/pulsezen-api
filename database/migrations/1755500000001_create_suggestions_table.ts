import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'suggestions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.string('id').primary()
      
      // Core suggestion fields
      table.string('title').notNullable()
      table.text('content').notNullable() // Full content of the suggestion
      table.string('summary', 500).notNullable() // Short summary for cards
      table.enum('category', ['mindfulness', 'anxiety', 'depression', 'self-care', 'productivity', 'relationships']).notNullable()
      table.enum('type', ['reading', 'exercise', 'meditation', 'reflection']).notNullable()
      table.integer('estimated_read_time').notNullable().defaultTo(5) // in minutes
      table.string('image_url').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      
      // Audit fields
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Indexes for performance
      table.index(['category'])
      table.index(['type'])
      table.index(['is_active'])
      table.index(['category', 'is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}