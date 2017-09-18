'use strict';

require('./global-regist');

const web = require('../servers/web');
const initDatabase = require('./init').initDatabase;

const testDirs = ['controllers', 'services'];

test.before(async () => {
  await web.start();
  await cache.flushdb();
  if (config.mysql.forceSync) {
    await initDatabase(require('../models'));
  }
});

testDirs.forEach(dir => {
  fs.readdirSync(path.join(__dirname, dir))
    .forEach(file => require(path.join(__dirname, dir, file)));
});
