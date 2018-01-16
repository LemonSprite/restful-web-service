'use strict';

const cache = require('./cache');
const TIME = require('../enums/time');

module.exports = {
  token() {
    return {
      key: 'token',
      expire: TIME.ONE_DAY
    };
  },

  userInfo(uid) {
    return {
      key: cache.genKey('user', uid),
      expire: TIME.ONE_DAY
    };
  },

  userState(uid) {
    return {
      key: cache.genKey('user', uid, 'state'),
      expire: TIME.WEEK
    };
  }
};
