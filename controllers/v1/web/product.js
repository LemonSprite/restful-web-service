'use strict';

module.exports = {
  get,
  add
};

async function get(req, res, next) {
  const products = await db.Products.findAll();
  return next({code: 200, msg: products})
}

async function add(req, res, next) {
  const product = await db.Products.create({price: Date.now() % 1000});  
  return next({code: 200, msg: product});
}
