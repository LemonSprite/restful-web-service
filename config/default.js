'use strict';

const pkg = require('../package.json');

module.exports = {
  web: {
    url: 'http://127.0.0.1:5555',
    host: '127.0.0.1',
    port: 5555,
    name: pkg.name
  },

  log: {
    dir            : '../logs',
    nolog          : /\.(js|css|png|jpg|jpeg|ico|svg|gif)/,
    format         : ':remote-addr :method :url :status :response-time ms :user-agent :content-length',
    level          : 'AUTO',
    replaceConsole : true,
    console        : true
  },

  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 2
  },

  redisSession: {
    host: '127.0.0.1',
    port: 6379,
    db  : 1
  },
  
  mysql: {
    host: '127.0.0.1',
    username: 'root',
    password: '123',
    port: 3306,
    database: 'test',
    // 连接 mysql 超时时间，毫秒，默认10s
    connectTimeout: 5000,
    // 连接池满时是否等待，默认为true
    waitForConnections: true,
    // 最大连接池数，默认10
    connectionLimit: 50,
    logging: true,
    forceSync: false
  }
};
