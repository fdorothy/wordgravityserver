const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: String
})

const LeaderboardSchema = new Schema({
  leaders: [
    {
      user: UserSchema,
      score: Number
    }
  ]
}, {timestamps: true})

module.exports = mongoose.model('Leaderboard', LeaderboardSchema)

