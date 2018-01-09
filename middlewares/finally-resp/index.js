'use strict';

const http = require('http');

/**
 * finallyResp
 * 
 * 成功：{ 想要的数据... }
 * 失败：{ error: ... }
 * 
 * @param {Object}          ret              - 处理前的结果对象
 * @param {String}          ret.status       - 状态
 * @param {*}               ret.msg          - 数据
 * @param {*}               ret.ext          - 扩展
 * @param {Error|String}    ret.err          - 错误
 * @param {String}          ret.desc         - 描述
 * @param {String}          ret.view         - 视图模板（渲染成功）
 * @param {String}          ret.errorView    - 视图模板（渲染出错）
 * @param {String}          ret.page         - 静态文件路径
 * @param {http.Request}    req                 - http.Request
 * @param {http.Reponse}    res                 - http.Response
 * @param {Function}        next                - app.next
 * @returns {*}
 */
module.exports = () => {
  return (ret, req, res, next) => {
    if (_.isError(ret)) {
      logError(req, ret);
      return res.status(500).json({error: 'Interval Server Error'});
    }

    if (!isCodeOk(ret.code)) {
      return res.status(500).json({error: 'invalid status code'});
    }

    if (!onlyOne(ret.data, ret.error)) {
      return res.status(500).json({error: 'illegal data or error'});
    }

    res.status(ret.code);

    if (ret.data) {
      return res.json(ret.data);
    } else {
      return res.json({error: ret.error});
    }
  };
};

function logError(req, err) {
  if (err instanceof Error) {
    logger.error('\nError Begin\n', err, '\n', req.method, req.url, '\nError End\n');
  } else {
    logger.warn('\nWarn Begin\n', err, '\n', req.method, req.url, '\nWarn End\n');
  }
}

function isCodeOk(code) {
  return code && http.STATUS_CODES[code];
}

function onlyOne(a, b) {
  return (a || b) && (!a || !b);
}
