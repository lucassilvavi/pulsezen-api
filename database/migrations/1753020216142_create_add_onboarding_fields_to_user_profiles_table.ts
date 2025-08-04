import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_profiles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add new onboarding fields
      table.string('display_name').nullable()
      table.enum('sex', ['MENINO', 'MENINA', 'OTHER']).nullable()
      table.integer('age').nullable()
      table.json('goals').nullable() // Array of goal IDs
      table.enum('experience_level', ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable()
      table.json('preferences').nullable() // General user preferences
      
      // Update existing field (if needed)
      // table.boolean('onboarding_completed').defaultTo(false).alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('display_name')
      table.dropColumn('sex') 
      table.dropColumn('age')
      table.dropColumn('goals')
      table.dropColumn('experience_level')
      table.dropColumn('preferences')
    })
  }
}