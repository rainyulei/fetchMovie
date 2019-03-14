const User = require('../models/mongoose_model/users_model')
/**
 *
 * @param {*user对象} user
 * 登录方法
 */
async function login (user) {
  try {
    const flog = await User.login(user)
    return flog
  } catch (e) {
    console.log(`${e}`)
  }
}
/**
 *
 * @param {谷歌登录回传的属性json  格式} profile
 * @param {提供者} provder
 * 找到一个或者创建一个对象
 */
async function findOneOrUpdate (profile, provder) {
  try {
    if (!profile || !provder) return // todo error
    const user = await User.findOneOrCreated(profile, provder)
    return user
  } catch (e) {
    console.log(`${e}`)
  }
}
/**
 * 查询是否有相同用户名的
 */
async function findUserByUserName (username) {
  if (!username) return // todo error
  const userEntry = await User.findUserByUserName(username)
  const usernameFlog = !userEntry
  return usernameFlog
}

/**
 * 查询是否有相同的邮箱
 */
async function findUserByEmail (email) {
  if (!email) return // todoerror
  const userEntry = await User.findUserByEmail(email)
  const emailFlog = !userEntry
  return emailFlog
}
/**
 *
 * @param {用户信息} user
 * 添加一个用户
 */
async function addUser (user) {
  const userEntry = await User.addUser(user)
  const userFlog = !!userEntry
  return userFlog
}

module.exports = {
  login,
  findOneOrUpdate,
  findUserByUserName,
  findUserByEmail,
  addUser
}
