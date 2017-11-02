'use strict';

// wu wai jian fang qian mian
const models = [
  'User',
  'Product'
  // ...
];

async function initDatabase(testDB) {
  for (const model of models) {
    await testDB[model].bulkCreate(require(`./data/${model}.json`));
  }
}

module.exports = {
  models,
  initDatabase
};
