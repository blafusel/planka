/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.boolean('open_card_on_create').notNullable().defaultTo(true);
  });

  return knex.schema.alterTable('user_account', (table) => {
    table.boolean('open_card_on_create').notNullable().alter();
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('open_card_on_create');
  });
