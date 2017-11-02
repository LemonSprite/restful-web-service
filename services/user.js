'use strict';

module.exports = {
  verifyAccount,
  regAccount,
  getProduct
};

function regAccount(opts) {
  return db.User.create(opts);
}

function verifyAccount({name, password}) {
  return db.User.findOne({where: {name, password}});
}

function getProduct(opts) {
  return db.Product.findAll({where: opts});
}
