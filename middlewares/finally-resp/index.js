'use strict';

const CODE = require('./defines').CODE;

const JSONSTRING = 'JSONString';
const ENCONDING = 'utf8';

/**
 * finallyResp
 * @param {Object} options
 * @param {Object} [options.format='JSONString'] - 默认接口返回的数据格式 JSON 或 JSONString
 * @param {Object} [options.enconding='utf8']    - 默认接口返回的数据编码
 * @returns {Function}
 */
module.exports = function (options = {}) {
  const defaultFormat = options.format || JSONSTRING;
  const enconding = options.enconding || ENCONDING;

  /**
   * finallyResp
   * @param {Object}          result              - 处理前的结果对象
   * @param {String}          result.status       - 状态
   * @param {*}               result.msg          - 数据
   * @param {*}               result.ext          - 扩展
   * @param {Error|String}    result.err          - 错误
   * @param {String}          result.desc         - 描述
   * @param {String}          result.view         - 视图模板（渲染成功）
   * @param {String}          result.errorView    - 视图模板（渲染出错）
   * @param {String}          result.page         - 静态文件路径
   * @param {http.Request}    req                 - http.Request
   * @param {http.Reponse}    res                 - http.Response
   * @param {Function}        next                - app.next
   * @returns {*}
   */
  return function finallyResp(result, req, res, next) {
    if (_.isError(result)) {
      result = {
        status : 'error',
        code   : 500,
        err    : result,
        msg    : result.message
      };
    }

    const final = CODE[result.code];

    if (!final) {
      throw new Error('result.code undefined!');
    }

    const msg    = result.msg || final.desc;
    const ext    = result.ext || {};
    const err    = result.err;
    const desc   = result.desc || final.desc;
    const format = result.format || req.query.format || defaultFormat;

    if (err) {
      logError(req, err);
    }

    const retObj = {
      RetSucceed : true,
      Succeed    : final.succeed,
      Code       : final.code,
      Desc       : desc,
      Message    : msg,
      ExtData    : ext
    };

    if (format === JSONSTRING) {
      res.send(JSON.stringify(retObj));
    } else {
      res.json(retObj);
    }
  };
};

function logError(req, err) {
  if (err instanceof Error || _.isError(err)) {
    logger.error('\nError Begin\n', err, '\n', req.method, req.url, '\nError End\n');
  } else {
    logger.warn('\nWarn Begin\n', err, '\n', req.method, req.url, '\nWarn End\n');
  }
}
