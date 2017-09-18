'use strict';

const models = [
    'User',
    'Product'
    // ...
];

async function initDatabase(db) {
  for(const model of models) {
    await db[model].bulkCreate(require(`./data/${model}.json`));
  }
}

module.exports = {
    models,
    initDatabase
};
