const mongoose = require('mongoose')
const User = require('./user')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: String
})

const ChallengeSchema = new Schema({
  owner: {type: UserSchema},
  invited: [
    UserSchema
  ],
  seed: Number,
  daily: {type: Boolean, default: false},
  leaders: [
    { user: UserSchema, score: Number }
  ]
}, {timestamps: true})

module.exports = mongoose.model('Challenge', ChallengeSchema)

