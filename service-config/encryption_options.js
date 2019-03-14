const path = require('path')
const rsaKeyPath = path.join(__dirname, '/pem')
module.exports = {
  AES: {
    AES_FRONT_PATH: rsaKeyPath + '/des_front_key.json',
    AES_BACK_PATH: rsaKeyPath + '/des_back_key.json',
    ALGORITHM: 'aes-256-cbc',
    INPUT_ENCODE: 'utf8',
    OUTPUT_ENCODE: 'base64'
  },
  SHA: {
    SHA_LENGTH: 2048,
    ENCRYPTION_SCHEME: 'pkcs1',
    SHA_FILE_PATH: rsaKeyPath,
    EXPORT_PRIVATE_KEY: 'pkcs1-private-pem',
    EXPORT_PUBLIC_KEY: 'pkcs1-public-pem'
  }
}
