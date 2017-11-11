'use strict';

const cache = require('./cache');

const ONE_MINUTE = 60;
const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = 60 * 60 * 24 * 7;

module.exports = {
  token() {
    return {
      key: 'token',
      expire: ONE_MINUTE
    };
  },

  userInfo(uid) {
    return {
      key: cache.genKey('user', uid),
      expire: ONE_DAY
    };
  },

  userState(uid) {
    return {
      key: cache.genKey('user', uid, 'state'),
      expire: ONE_WEEK
    };
  }
};
