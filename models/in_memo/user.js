// 如果只有属性则是贫血 没有方法 最好是有功能性操作 也就是数据的持久化操作的地方与数据库操作
const users = []
class User {
  constructor (name, age) {
    this.name = name
    this.age = age
  }
  getName () { // 获取属性方法
    return this.name
  }
  static insert (name, age) { // 获取相应对象方法
    const u = new User(...arguments)
    User.users.push(u)
    console.log(users, 'insert')
    return u
  }
  static getOneByName (name) {
    return User.users.find(u => u.name === name)
  }
  static list (query) {
    return User.users
  }
  static get ['users'] () {
    return users
  }
}
// 抽象化的数据解构
console.log('User.insert :', User.insert('hahah', 19))
console.log(User.list())
console.log('User.insert :', User.insert('hahah', 19))
console.log('User.list :', User.list())
console.log('User.insert :', User.insert('hahah', 19))
console.log('User.list :', User.list())
console.log('users :', users)
// User.list()
// User.users() //会把users数组返回出去  静态方法
module.exports = User
