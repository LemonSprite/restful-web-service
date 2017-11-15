'use strict'

/**
 * http 请求重试
 *
 * @param {any} fn
 * @returns {*}
 */
module.exports = fn => {
  if (typeof fn === 'function') {
    return retry(fn);
  }
  if (typeof fn === 'object') {
    Object.keys(fn).forEach(i => (fn[i] = retry(fn[i])));
  }
  return fn;
}

/**
 * http 请求重试
 *
 * @param {any} fn
 * @param {number} [times=3]
 * @param {number} [delay=0]
 * @returns {*}
 */
function retry(fn, times = 3, delay = 0) {
  return function request(...args) {
    return fn(...args).catch(err => {
      if (needRetry(err)) {
        if (times-- > 0) {
          return Promise.delay(delay).then(() => request(...args));
        } else {
          err.message += ' 已重试3次';
          logger.error('HTTP Retry: ', err.toString());
          return Promise.reject(err);
        }
      } else {
        return Promise.reject(err);
      }
    });
  }
}

/**
 * 对系统异常进行判断，决定是否重试
 *
 * @param {any} err
 * @returns {*}
 */
function needRetry(err) {
  const errMsg = err.toString().toLowerCase();
  return errMsg.includes('socket hang up')
    || errMsg.includes('timeout')
    || errMsg.includes('econnreset')
    || errMsg.includes('econnrefused')
    || errMsg.includes('etimedout');
}
