'use strict';

const Limiter = require('ratelimiter');

module.exports = (req, res, next) => {
  const id = utils.getClientIP(req);
  const rateLimit = new Limiter({ id: id, db: cache, max: 60, duration: 60000 });
  rateLimit.get((err, limit) => {
    if (err) {
      return next(err);
    }
  
    res.set('X-RateLimit-Limit', limit.total);
    res.set('X-RateLimit-Remaining', limit.remaining - 1);
    res.set('X-RateLimit-Reset', limit.reset);
  
    if (limit.remaining) {
      return next();
    } else {
      return next({code: 429, error: '您的请求过于频繁，请稍后再试'});
    }
  });
};
