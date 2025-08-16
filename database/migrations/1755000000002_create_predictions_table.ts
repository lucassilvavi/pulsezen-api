import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'predictions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      
      // User relationship
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      
      // Prediction data
      table.decimal('risk_score', 4, 3).notNullable() // 0.000 to 1.000
      table.string('risk_level', 20).notNullable() // 'low', 'medium', 'high', 'critical'
      table.decimal('confidence_score', 4, 3).notNullable() // 0.000 to 1.000
      
      // Analysis data
      table.jsonb('factors').notNullable().defaultTo('[]') // Contributing factors
      table.jsonb('interventions').notNullable().defaultTo('[]') // Suggested interventions
      
      // Metadata
      table.string('algorithm_version', 10).notNullable().defaultTo('1.0')
      table.timestamp('expires_at', { useTz: true }).notNullable()
      
      // Timestamps
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })

    // Create indexes and constraints
    this.schema.raw(`
      CREATE INDEX idx_predictions_user_id ON predictions(user_id);
      CREATE INDEX idx_predictions_created_at ON predictions(created_at);
      CREATE INDEX idx_predictions_expires_at ON predictions(expires_at);
      CREATE INDEX idx_predictions_risk_level ON predictions(risk_level);
      CREATE INDEX idx_predictions_risk_score ON predictions(risk_score);
      
      ALTER TABLE predictions ADD CONSTRAINT valid_risk_level 
        CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));
      ALTER TABLE predictions ADD CONSTRAINT valid_risk_score 
        CHECK (risk_score >= 0.000 AND risk_score <= 1.000);
      ALTER TABLE predictions ADD CONSTRAINT valid_confidence_score 
        CHECK (confidence_score >= 0.000 AND confidence_score <= 1.000);
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
