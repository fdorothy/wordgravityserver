const mongoose = require('mongoose')
const User = require('./user')
const Schema = mongoose.Schema

const PlayerSchema = new Schema({
  name: String, // name of the player
  wins: {type: Number, default: 0}, // total number of wins
  losses: {type: Number, default: 0}, // total number of losses
  score: {type: Number, default: 0} // current score
})

const UserSchema = new Schema({
  name: String
})

const ChallengeSchema = new Schema({
  players: [PlayerSchema], // each user in the challenge, can be more than just 2!
  turn: {type: Number, default: 0}, // index into players[] whose current turn it is
  seed: Number, // seed for current challenge
  random: false,
  power: {type: Number, default: 0},
  leaders: [
    {
      user: UserSchema,
      score: Number
    }
  ]
}, {timestamps: true})

module.exports = mongoose.model('Challenge', ChallengeSchema)
