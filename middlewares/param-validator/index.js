'use strict';

const expressValidator = require('express-validator');

const validateConf = require('./config');
const validateMods = require('../../valications');

const sanitizeMap = {
  isInt        : 'toInt',
  isFloat      : 'toFloat',
  isDate       : 'toDate',
  isArray      : 'toArray',
  isIntArray   : 'toIntArray',
  isStringArray: 'toStringArray',
  isObject     : 'toObject'
};

// 初始化参数验证中间件
module.exports = router => {
  router.use(expressValidator(validateConf));
  Object.values(validateMods).forEach(mod => {
    Object.values(mod).forEach(api => {
      const {method, route, schema} = api;
      router[method](route, addDefaultValue(schema), validateReq(schema));
    });
  });
};

// 根据 schema 定义添加默认值
function addDefaultValue(schema) {
  return (req, res, next) => {
    for (const field in schema) {
      const opts = schema[field];
      if (('defaultValue' in opts) && opts.in) {
        req[opts.in][field] = req[opts.in][field] || opts.defaultValue;
      }
    }
    return next();
  };
}

// 根据 schema 验证 req 表单
function validateReq(schema) {
  return async (req, res, next) => {
    if (req.checked) {
      return next();
    }

    const newSchema = _.cloneDeep(schema);
    for (const field in newSchema) {
      if ('defaultValue' in newSchema[field]) {
        delete newSchema[field].defaultValue;
      }
    }

    req.check(newSchema);
    const result = await req.getValidationResult();
    if (result.isEmpty()) {
      reqFilter(schema, req, next);
    } else {
      const errors = result.useFirstErrorOnly().array();
      return next({code: 400, msg: errors[0].msg});
    }
  };
}

// 根据 schema 过滤 req 参数
function reqFilter(schema, req, next) {
  ['query', 'params', 'body'].forEach(where => {
    Object.keys(req[where]).forEach(field => {
      const opts = schema[field];
      if (!(opts && opts.in && opts.in === where)) {
        return delete req[where][field];
      }

      // 遍历 sanitizeMap, 查找 schema 验证的字段有没有对应的验证类型，如果有，则调用数据转换方法
      for (const sanitizeKey in sanitizeMap) {
        if (opts[sanitizeKey]) {
          req.sanitize(field)[sanitizeMap[sanitizeKey]]();
        }
      }
    });
  });
  // 防止进入其他路由
  req.checked = true;
  return next();
}
