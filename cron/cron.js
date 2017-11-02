'use strict';

const CronJob = require('cron').CronJob;

exports.init = function () {
  // 10 minutes
  new CronJob('0 10 * * * *', () => {
    console.log('I am cron task.');
  });
};
