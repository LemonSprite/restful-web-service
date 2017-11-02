'use strict';

const userService = require('../../../services/user');

module.exports = handleError({
  login,
  reg,
  logout
});


/**
 * 登录
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @returns
 */
async function login(req, res, next) {
  let {name, password} = req.body;
  let userInfo = await userService.verifyAccount({name, password});
  if (userInfo) {
    return next({code: 200, msg: '登录成功', ext: userInfo});
  }
  return next({code: 200, msg: '登录失败'});
}

/**
 * 注册账号
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @returns
 */
async function reg(req, res, next) {
  let {name, password} = req.body;
  await userService.regAccount({name, password});
  return next({code: 200, msg: '注册成功'});
}

function logout(req, res, next) {

}
