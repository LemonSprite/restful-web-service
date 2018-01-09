'use strict';

module.exports = {
  index,
  detail
};

function index(req, res, next) {
  return next({code: 200, data: "It's is Index."});
}

function detail(req, res, next) {
  return next({code: 200, data: "It's is Detail."});
}
