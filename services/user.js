'use strict';

module.exports = {
  verifyAccount,
  regAccount,
  getProduct
};

async function regAccount(opts) {
  return await db.User.create(opts);
}

async function verifyAccount(opts) {
  return await db.User.findOne({where: {name: opts.name, password: opts.password}});
}

async function getProduct(opts) {
  return await db.Product.findAll({where: opts});
}
