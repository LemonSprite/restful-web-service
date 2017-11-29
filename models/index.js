'use strict';

const Sequelize = require('sequelize');

const options = {
  port          : config.mysql.port,
  dialect       : 'mysql',
  dialectOptions: {
    charset: 'utf8mb4'
  },
  logging(output) {
    if (config.mysql.logging) {
      logger.info(output);
    }
  }
}

let sequelize;
if (process.env.NODE_ENV === 'production') {
  options.replication = {read: config.mysql.read, write: config.mysql.write};
  sequelize = new Sequelize(config.mysql.database, null, null, options);
} else {
  options.host = config.mysql.host;
  sequelize = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, options);
}

// eslint-disable-next-line
const db = {};

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
