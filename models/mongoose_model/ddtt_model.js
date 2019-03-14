const mongoose = require('mongoose')

const Schema = mongoose.Schema()

const DdttSchema = new Schema({
  _id: Schema.Type.ObjectId,
  dyid: {
    type: String,
    required: true
  },
  originalHtml: {
    type: String
  },
  dyName: {
    type: String,
    required: true
  },
  createdTime: {
    type: Date
  },
  modefileDate: {
    type: Date
  },
  pictures: [],
  headerPicture: {
    type: String
  },
  thunderDownLoadLink: {
    type: String
  },
  content: {
    type: String
  },
  marginThunderDownLoadLink: {
    type: String
  },
  canDownLoad: {
    type: Boolean
  }
})
const DdttModel = mongoose.model('ddtt', DdttSchema)
async function findbyDyid (dyid) {
  if (!dyid) return
  const DyEntry = await DdttModel.find({
    dyid: dyid
  })
  return DyEntry
}
async function findbyDyname (dyName) {
  if (!dyName) return
  const DyEntry = await DdttModel.find({
    dyName: dyName
  })
  return DyEntry
}
async function findbyCanDownLoad (canDownLoad = true) {
  const DyEntry = await DdttModel.find({
    canDownLoad: canDownLoad
  })
  return DyEntry
}
async function addmovie (movie, count) {
  let DyEntry
  if (count === 0) return
  else if (count === 1) DyEntry = await DdttModel.insert(movie)
  else DyEntry = await DdttModel.insertMany(movie)
  return DyEntry
}
async function fiadnAll () {
  const DyEntrys = await DdttModel.find()
  return DyEntrys
}

module.exports = {
  findbyDyid,
  fiadnAll,
  addmovie,
  findbyCanDownLoad,
  findbyDyname
}
