'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const SessStore = require('connect-redis')(expressSession);
const compression = require('compression');
const responseTime = require('response-time');

const router = require('../routes');
const finallyResp = require('../middlewares/finally-resp');
const apiNotExist = require('../middlewares/api-not-exist');
const secureHttpHeader = require('../middlewares/secure-http-header');

const app = express();

app.use(secureHttpHeader());

// 对响应进行 gzip 压缩，降低响应主体的大小，提高 web 应用程序的速度 (使用 nginx 进行 gzip 压缩则无需此中间件)
app.use(compression());

// 在 Response Headers 里添加 X-Response-Time 首部来显示响应的时间
app.use(responseTime());

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

app.use(router);

app.use(apiNotExist());

app.use(finallyResp());

function start() {
  app.listen(config.web.port, function () {
    logger.info(config.web.name, config.web.url, 'start up');
  });
  return db.sequelize.sync({force: config.mysql.forceSync}).catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

exports.start = start;
