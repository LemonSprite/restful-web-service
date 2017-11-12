'use strict';

/**
 * 对 controller 进行异常捕捉
 * @param {any} controllers
 * @returns {*}
 */
module.exports = controllers => {
  if (typeof controllers === 'function') {
    return catchError(controllers);
  }
  if (typeof controllers === 'object') {
    Object.keys(controllers)
      .filter(ctrl => typeof controllers[ctrl] === 'function')
      .forEach(ctrl => (controllers[ctrl] = catchError(controllers[ctrl])));
  }
  return controllers;
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
      return ret.catch(err => next({code: 500, msg: err.message || err, err: err}));
    } else {
      return ret;
    }
  };
}
