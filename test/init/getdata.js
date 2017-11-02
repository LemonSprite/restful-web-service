'use strict';

const Sequelize = require('sequelize');
const models = require('./index').models;

const db = {};
const modelPath = path.join(__dirname, '../../models');

const testDB = {
  host: '127.0.0.1',
  username: 'root',
  password: '123',
  port: 3306,
  database: 'test'
};

const sequelize = new Sequelize(testDB.database, testDB.username, testDB.password, {
  host          : testDB.host,
  port          : testDB.port,
  dialect       : 'mysql',
  dialectOptions: {
    charset: 'utf8mb4'
  }
});

// eslint-disable-next-line
fs.readdirSync(modelPath)
  .filter(file => (file.indexOf('.') !== -1) && (file !== 'index.js'))
  .forEach(file => {
    const model = sequelize.import(path.join(path.join(modelPath, file)));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

const DB = Object.assign({
  sequelize,
  Sequelize
}, db);

async function getInitData() {
  for (const model of models) {
    const data = await DB[model].findAll();
    fs.writeFile(`${__dirname}/data/${model}.json`, JSON.stringify(data));
  }
}

getInitData();
