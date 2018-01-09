'use strict';

const helmet = require('helmet');

module.exports = () => {
  return helmet({
    // remove the X-Powered-By header
    hiddPoweredBy: true,

    // X-Frame-Options: DENY
    frameguard: {action: 'deny'},
    
    // X-Content-Type-Options: nosniff
    noSniff: true,

    // X-XSS-Protection: 1; mode=block
    xssFilter: true,
  
    // cancel helmet's default config
    dnsPrefetchControl: false,
    hsts: false,
    ieNoOpen: false
  });
};
