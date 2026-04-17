/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.boolean('add_self_on_card_create').notNullable().defaultTo(true);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('add_self_on_card_create');
  });
};
