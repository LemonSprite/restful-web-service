'use strict';

/**
 * 对 controller 进行异常捕捉
 * @param {any} params
 * @return params
 */
module.exports = function (controller) {
  if (typeof controller === 'function') {
    return catchError(controller);
  }
  if (typeof controller === 'object') {
    Object.keys(controller)
      .filter(api => typeof controller[api] === 'function')
      .forEach(api => (controller[api] = catchError(controller[api])));
  }
  return controller;
};

/**
 * 处理错误
 * @param {function} controller
 * @returns {function}
 */
function catchError(controller) {
  return (req, res, next) => {
    const ret = controller.apply(null, arguments);
    if (ret && typeof ret.then === 'function') {
      return ret.catch(err => {
        if (err.code && err.error) {
          return next(err)
        } else {
          return next({code: 500, err, err: err});
        }
      });
    } else {
      return ret;
    }
  };
}
