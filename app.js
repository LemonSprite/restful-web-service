'use strict';

if (process.env === 'production') {
  require('newrelic');
}

require('./global-variable');

const web = require('./servers/web');
const cron = require('./cron/cron');

web.start();
cron.init();
