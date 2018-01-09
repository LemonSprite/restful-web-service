'use strict';

module.exports = () => {
  return (req, res, next) => {
    return next({code: 404, error: 'api not found'});
  };
};
