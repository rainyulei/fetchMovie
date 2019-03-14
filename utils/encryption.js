const CryptoJS = require('crypto-js')
const options = require('../service-config/encryption_options')
const NodeRSA = require('node-rsa')
const fs = require('./fs')
const createRandomCode = require('./create_random_code')
/**
 * 创建一个前端用于AES的加密字符串salt长度为20位
 * 存储到文件路径中
 */
async function createFrontAESKEY () {
  const key = createRandomCode(false, 32)
  const iv = createRandomCode(false, 16)
  const keyJson = JSON.stringify({
    AES_KEY: key,
    AES_IV: iv
  })
  await fs.writeFileAsync(options.AES.AES_FRONT_PATH, keyJson)
}
/**
 * 创建一个后端用于AES的加密字符串salt长度为20位
 * 存储到文件路径中
 */
async function createBackAESKEY () {
  const key = createRandomCode(false, 32)
  const iv = createRandomCode(false, 16)
  const keyJson = JSON.stringify({
    AES_KEY: key,
    AES_IV: iv
  })
  await fs.writeFileAsync(options.AES.AES_BACK_PATH, keyJson)
}

/**
 * 获取前端的AES的加密salt
 */
async function getFrontAESKey () {
  const file = await fs.readFileAsync(options.AES.AES_FRONT_PATH)
  return JSON.parse(file)
}
/**
 * 获取后端的AES的加密salt
 */
async function getBackAESKey () {
  const file = await fs.readFileAsync(options.AES.AES_BACK_PATH)
  return JSON.parse(file)
}
/**
 * AES文本加密方法
 * @param{doc}需要加密的数据
 * @param{key}需要的key
 */
async function encryptAES (str, key, iv) {
  key = CryptoJS.enc.Utf8.parse(key)
  iv = CryptoJS.enc.Utf8.parse(iv)
  var encrypted = CryptoJS.AES.encrypt(str, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  encrypted = encrypted.toString()
  return encrypted
}
/**
 * AES文本解密方法
 * @param{doc}需要解密的数据
 * @param{key}需要的key
 */
function decryptAES (encrypted, key, iv) {
  key = CryptoJS.enc.Utf8.parse(key)
  iv = CryptoJS.enc.Utf8.parse(iv)
  var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  // 转换为 utf8 字符串
  decrypted = CryptoJS.enc.Utf8.stringify(decrypted)
  return decrypted
}

/**
 *
 * 创建res的一对密匙并且保存到service-config/pem 文件夹中
 * 密匙的文件名格式为public_key.pem
 * 密匙生成后会自动覆盖原密匙
 * 密匙生成格式和长度从options中设置
 */
async function createRSAKEY () {
  var key = new NodeRSA({
    b: options.SHA.SHA_LENGTH
  })
  key.setOptions({
    encryptionScheme: options.SHA.ENCRYPTION_SCHEME
  })
  var privatePem = key.exportKey(options.SHA.EXPORT_PRIVATE_KEY)
  var publicPem = key.exportKey(options.SHA.EXPORT_PUBLIC_KEY)
  await fs.writeFileAsync(`${options.SHA.SHA_FILE_PATH}/public_key.pem`, publicPem)
  await fs.writeFileAsync(`${options.SHA.SHA_FILE_PATH}/private_key.pem`, privatePem)
  // TODO 失败做日志处理
}
/**
 * 发送一个用于加密的公钥
 */
async function getRSAPublicKey () {
  const publicStr = await fs.readFileAsync(`${options.SHA.SHA_FILE_PATH}/public_key.pem`)
  return publicStr
}
/**
 * 这个方法提供使用当前公钥匙进行加密
 * @param {需要加密的数据} doc
 *@param {用于加密的公匙字符串} publicStr
 */
async function encryptRSA (doc, publicStr) {
  if (!doc) return
  if (!publicStr) return
  const publicKey = new NodeRSA(publicStr)
  const cipherDoc = publicKey.encrypt(doc, 'base64')
  return cipherDoc
}
/**
 * 这个方法使用私钥进行解密
 * @param {需要解密的数据} doc
 */
async function decryptRSA (doc) {
  if (!doc) return
  const privateStr = await fs.readFileAsync(`${options.SHA.SHA_FILE_PATH}/private_key.pem`)
  if (!privateStr) return
  const privateKey = new NodeRSA(privateStr)
  const decryDoc = privateKey.decrypt(doc, 'utf8')
  return decryDoc
}

module.exports = {
  createFrontAESKEY,
  createBackAESKEY,
  getFrontAESKey,
  getBackAESKey,
  decryptAES,
  encryptAES,
  createRSAKEY,
  getRSAPublicKey,
  encryptRSA,
  decryptRSA

}
