import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Moments extends BaseSchema {
  protected tableName = 'moments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.string('image').notNullable()

      table.timestamps(true) // cria created_at e updated_at automaticamente
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
