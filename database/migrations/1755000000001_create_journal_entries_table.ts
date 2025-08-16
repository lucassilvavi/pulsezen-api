import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'journal_entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      
      // User relationship
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      
      // Content fields
      table.text('content').notNullable()
      table.integer('word_count').defaultTo(0)
      table.integer('reading_time_minutes').defaultTo(0)
      
      // Prompt fields
      table.string('prompt_id', 255).nullable()
      table.string('prompt_category', 100).notNullable()
      table.text('custom_prompt').nullable()
      
      // Mood and emotional data
      table.jsonb('mood_tags').defaultTo('[]')
      table.decimal('sentiment_score', 3, 2).nullable() // -1.00 to 1.00
      
      // User interaction
      table.boolean('is_favorite').defaultTo(false)
      table.string('privacy_level', 20).defaultTo('private')
      
      // Metadata
      table.jsonb('metadata').defaultTo('{}')
      
      // Timestamps
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      
      // Constraints will be added via raw SQL
    })

    // Create indexes and constraints
    this.schema.raw(`
      CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
      CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
      CREATE INDEX idx_journal_entries_prompt_category ON journal_entries(prompt_category);
      CREATE INDEX idx_journal_entries_mood_tags ON journal_entries USING GIN(mood_tags);
      CREATE INDEX idx_journal_entries_sentiment ON journal_entries(sentiment_score);
      CREATE INDEX idx_journal_entries_word_count ON journal_entries(word_count);
      
      ALTER TABLE journal_entries ADD CONSTRAINT valid_privacy_level 
        CHECK (privacy_level IN ('private', 'shared', 'anonymous'));
      ALTER TABLE journal_entries ADD CONSTRAINT valid_sentiment_score 
        CHECK (sentiment_score >= -1.00 AND sentiment_score <= 1.00);
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
