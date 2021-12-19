const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: String
})

const LeaderboardSchema = new Schema({
  _id: String,
  leaders: [
    {
      user: UserSchema,
      score: Number
    }
  ],
  seed: Number
}, {timestamps: true})

module.exports = mongoose.model('Leaderboard', LeaderboardSchema)

