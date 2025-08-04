import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('first_name', 100).nullable()
      table.string('last_name', 100).nullable()
      table.date('date_of_birth').nullable()
      table.string('timezone', 50).defaultTo('UTC')
      table.string('language', 10).defaultTo('en')
      table.text('avatar_url').nullable()
      table.boolean('onboarding_completed').defaultTo(false)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Indexes
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
