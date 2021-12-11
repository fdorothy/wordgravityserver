const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ApiKeySchema = new Schema({
  key: String
}, {timestamps: true})

module.exports = mongoose.model('ApiKey', ApiKeySchema)

