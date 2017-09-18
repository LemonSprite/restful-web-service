'use strict';

require('../global-variable');

const RP = require('request-promise');

global.test = require('ava');

global.rp = RP.defaults({
  baseUrl: `${config.web.url}/api/v1`,
  json: true
});

global.requestSuccess = (t, res) => {
  t.true(res.RetSucceed);
  t.true(res.Succeed);
  t.is(res.Code, 200);
};

global.requestFailed = (t, res) => {
  t.true(res.RetSucceed);
  t.false(res.Succeed);
  t.is(res.Code, 500);
};
