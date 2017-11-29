'use strict';

module.exports = {
  web: {
    
  },

  mysql: {
    read: [{host: '10.32.8.122', username: 'test', password: '123'}],
    write: {host: '10.32.10.66', username: 'test', password: '123'},
    logging: false
  },
  
  log: {
    console: false
  }
};
