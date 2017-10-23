'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const SessStore = require('connect-redis')(expressSession);
const responseTime = require('response-time');
const compression = require('compression');
const expressValidator = require('express-validator');

const router = require('../routes');
const finallyResp = require('../middlewares/finally-resp');
const validatorConfig = require('../middlewares/param-validator/config');

const app = express();

// 禁用 x-powered-by 头部
// 防止攻击者可能会使用该头（缺省情况下已启用）来检测运行 Express 的应用程序，然后发动针对特定目标的攻击。
app.disable('x-powered-by');

// 对响应进行 gzip 压缩，降低响应主体的大小，提高 web 应用程序的速度 (使用 nginx 进行 gzip 压缩则无需此中间件)
app.use(compression());

// 在 Response Headers 里添加 X-Response-Time 首部来显示响应的时间
app.use(responseTime());

// 记录日志
app.use(logger.log4js.connectLogger(logger, config.log));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(expressSession({
  name              : 'test',
  proxy             : true,
  resave            : true,
  saveUninitialized : false,
  secret            : 'secret',
  store             : new SessStore(config.redisSession),
  cookie            : {maxAge: 1000 * 60 * 60 * 24 * 7}
}));

app.use(expressValidator(validatorConfig));

app.use(router);

app.use(function (req, res, next) {
  next({code: 404});
});

// 错误处理
app.use(finallyResp({
  format: 'JSON',
  encoding: 'utf8'
}));

function start() {
  app.listen(config.web.port, function () {
    logger.info(config.web.name, config.web.url, 'start up');
  });
  return db.sequelize.sync({force: config.mysql.forceSync}).catch((err) => {
    logger.error(err);
    process.exit(1);
  });
}

exports.start = start;
