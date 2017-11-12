'use strict';

function parseString(value) {
  return typeof value === 'string' ? JSON.parse(value) : value;
}

// 自定义验证方法
const customValidators = {
  isArray(value) {
    try {
      return Array.isArray(parseString(value));
    } catch (e) {
      return false;
    }
  },
  
  isIntArray(value) {
    try {
      value = parseString(value);
      return Array.isArray(value) && value.every(item => Number.isInteger(Number(item)));
    } catch (e) {
      return false;
    }
  },

  isStringArray(value) {
    try {
      value = (typeof value === 'string') ? JSON.parse(value) : value;
      return Array.isArray(value) && value.every(item => typeof item === 'string');
    } catch (e) {
      return false;
    }
  },

  isObject(value) {
    try {
      return typeof parseString(value) === 'object';
    } catch (e) {
      return false;
    }
  },

  isString(value) {
    return typeof value === 'string';
  }
};

// 自定义sanitizer
const customSanitizers = {
  toArray(value) {
    return parseString(value);
  },
  toIntArray(value) {
    return parseString(value).map(Number);
  },
  toStringArray(value) {
    return parseString(value).map(String);
  },
  toObject(value) {
    return parseString(value);
  }
};

// 自定义错误格式化
function errorFormatter(param, msg, value) {
  const namespace = param.split('.');
  let formParam = namespace.shift();

  while (namespace.length) {
    formParam += `[${namespace.shift()}]`;
  }

  return {
    param : formParam,
    msg   : msg,
    value : value
  };
}

module.exports = {
  customSanitizers,
  customValidators,
  errorFormatter
};
