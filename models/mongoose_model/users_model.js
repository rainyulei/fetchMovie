const mongoose = require('mongoose')
var Schema = mongoose.Schema
var UserSchema = new Schema({
  username: {
    type: String
  },
  displayname: String,
  name: {
    familyName: String,
    givenName: String
  },
  nickName: String,
  photos: [],
  password: String,
  emails: [],
  gender: String,
  thirdPart: {
    id: String,
    provider: String,
    refreshToken: String,
    refreshTokenexpireAt: Number,
    origenalDoc: {}
  }
})

const Usermodel = mongoose.model('User', UserSchema)
/**
 *
 * @param {用户名} username
 * 通过用户名查找用户
 */
async function findUserByUserName (username) {
  const userEntry = await Usermodel.findOne({
    username: username
  })
  return userEntry
}
/**
 *
 * @param {邮箱} email
 * 通过邮箱来查找用户
 *
 */
async function findUserByEmail (email) {
  const userEntry = await Usermodel.findOne({
    email: email
  })
  return userEntry
}
/**
 *
 * @param {第三方资料} userinfo
 * 通过第三方ID 更新用户
 */
async function findUserOrUpdate (userinfo) {
  if (!userinfo) return // todo error
  let userFindEntry = await Usermodel.find({
    'thirdPart.id': userinfo.profile.id
  })
  if (!userFindEntry[0]) return false // 没有查到返回false
  // 查到之后检查刷新令牌是否过期
  if (userFindEntry[0].thirdPart.refreshTokenexpireAt < Date.now().valueOf()) { // 如果刷新令牌过期就重新更新用户信息
    const userUpdateEntry = {
      name: {
        familyName: userinfo.profile.name.familyName,
        givenName: userinfo.profile.name.givenName
      },
      displayname: userinfo.profile.displayName,
      photos: userinfo.profile.photos,
      emails: userinfo.profile.emails,
      thirdPart: {
        refreshToken: userinfo.refreshToken, // 这里要做定期删除
        refreshTokenexpireAt: Date.now().valueOf() + 30 * 24 * 60 * 60,
        origenalDoc: userinfo.profile._json
      }
    }
    console.log(`userUpdateEntry${userUpdateEntry}`)
    userFindEntry = await Usermodel.findOneAndUpdate({
      'thirdPart.id': userinfo.profile.id
    }, {
      $set: userUpdateEntry
    }, {
      new: true
    })
  }

  return userFindEntry
}
/**
 *
 * @param {包装对象} profile
 * 找到一个用户或者创建一个用户
 * 如果能找到就返回找到的用户
 * 如果找不到就创建一个
 *
 */
async function findOneOrCreated (userInfo) {
  if (!userInfo) {
    return
  } // todo error
  const provider = userInfo.profile.provider
  let user = await findUserOrUpdate(userInfo)

  if (user) {
    return user
  } else user = await createUserFromThirdPart(userInfo.profile, provider, userInfo.refreshToken)
  return user
}
/**
 *
 * @param {*包装对象} profile
 * @param {*提供者} provider
 * 通过第三方创建用户
 */
async function createUserFromThirdPart (profile, provider, refreshToken) {
  console.log(profile.displayName)
  const userEntry = new Usermodel({
    name: {
      familyName: profile.name.familyName,
      givenName: profile.name.givenName
    },
    displayname: profile.displayName,
    photos: profile.photos,
    emails: profile.emails,
    thirdPart: {
      id: profile.id,
      provider: provider,
      refreshToken: refreshToken, // 这里要做定期删除
      refreshTokenexpireAt: Date.now().valueOf() + 30 * 24 * 60 * 60,
      origenalDoc: profile._json
    }
  })
  const user = await userEntry.save()
  return user
}
/**
 *
 * @param {用户} user
 */
async function addUser (user) {
  const userEntry = new Usermodel({
    username: user.username,
    emails: [{
      'value': user.email,
      'type': 'account'
    }],
    password: user.password,
    gender: user.gender
  })
  const userNew = await userEntry.save()
  return userNew
}

/**
 *
 * @param {用户} user
 * 用户登录
 */
async function login (user) {
  const userEntry = await Usermodel.find({
    username: user.username,
    password: user.password
  })
  return userEntry
}

/**
 * 输出模块
 */
module.exports = {
  findUserByUserName,
  login,
  findOneOrCreated,
  Usermodel,
  findUserByEmail,
  addUser
}
