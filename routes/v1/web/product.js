'use strict';

const product = require('../../../controllers/v1/web/product');

module.exports = function (router) {
  router.get('/products', product.get);  
  router.post('/products', product.add);
};
