const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LeaderboardSchema = new Schema({
  leaders: [
    {
      name: String,
      score: Number
    }
  ]
}, {timestamps: true})

module.exports = mongoose.model('Leaderboard', LeaderboardSchema)

