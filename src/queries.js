const User = require('./models/user.js')
const ApiKey = require('./models/apikey.js')
const Leaderboard = require('./models/leaderboard.js')
const Challenge = require('./models/challenge.js')

class Queries {
  static getInstance() {
    if (!Queries.instance)
      Queries.instance = new Queries()
    return Queries.instance
  }

  constructor()
  {
    ApiKey.findOne({}, (err, doc) => {
      this.apiKey = doc
    })
  }

  register = async (name) => {
    const user = new User({name})
    await user.save()
    return user
  }

  validateApiKey = (key) => {
    return this.apiKey && this.apiKey.key === key
  }

  createChallenge = async (user) => {
    const challenge = new Challenge({owner: user, seed: this.randomSeed()})
    await challenge.save()
    return challenge
  }

  getLeaderboard = async () => {
    let leaders = await Leaderboard.findOne()
    if (leaders == null) {
      leaders = new Leaderboard()
      await leaders.save()
    }
    return leaders
  }

  getChallenge = async (challenge_id) => {
    return await Challenge.findById(challenge_id)
  }

  addScore = async (user, score) => {
    const leaderDoc = await this.getLeaderboard()
    const leaders = this.addScoreToLeaders(leaderDoc.leaders, user, score)
    leaderDoc.leaders = leaders
    await leaderDoc.save()
    return leaderDoc
  }

  addChallengeScore = async (challenge, user, score) => {
    const leaders = this.addScoreToLeaders(challenge.leaders, user, score)
    challenge.leaders = leaders
    await challenge.save()
    return challenge
  }

  addScoreToLeaders = (leaders, user, score) => {
    return [...leaders, {user, score}].sort((a, b) => b.score-a.score).slice(0, 5)
  }

  randomSeed = () => Math.floor(Math.random() * 4096 + 1)
}

module.exports = { Queries }
