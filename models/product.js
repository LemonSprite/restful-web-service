'use strict';

// 定义表结构
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Products', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      commemt: '价格'
    }
  }, {
    // 设置表名跟定义的一样，如果不设置，默认会加s,如 'users'。
    tableName: 'products',
    freezeTableName: true,
    timestamps: false
  });
};
