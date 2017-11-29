'use strict';

const Sequelize = require('sequelize');

// eslint-disable-next-line
const db = {};

const sequelize = new Sequelize(config.mysql.database, null, null, {
  host          : config.mysql.host,
  port          : config.mysql.port,
  dialect       : 'mysql',
  dialectOptions: {
    charset: 'utf8mb4'
  },
  // replication: {
  //   read: [{host: '10.32.8.122', username: 'test', password: '123'}],
  //   write: {host: '10.32.10.66', username: 'test', password: '123'}
  // },
  logging       : function (output) {
    if (config.mysql.logging) {
      logger.info(output);
    }
  }
});

// eslint-disable-next-line
fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== -1) && (file !== 'index.js'))
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

module.exports = Object.assign({
  sequelize,
  Sequelize
}, db);
