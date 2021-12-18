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

  createChallenge = async (user, seed) => {
    const challenge = new Challenge({owner: user, seed})
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
    if (challenge_id === 'daily')
      return await Challenge.findOne({daily: true})
    else
      return await Challenge.findById(challenge_id)
  }

  getChallenges = async (user_id) => {
    const challenges = await Challenge.find({'owner._id': user_id})
    return challenges
  }

  getDailyChallenge = async () => {
    const challenge = await Challenge.findOne({daily: true})
    return challenge
  }

  createDailyChallenge = async () => {
    const challenge = new Challenge({daily: true, seed: this.randomSeed()})
    await challenge.save()
    return challenge
  }

  rolloverDailyChallenge = async () => {
    Challenge.deleteMany({daily: true})
    this.createDailyChallenge()
    setTimeout(this.setDailyChallengeTimer, 60)
  }

  setDailyChallengeTimer = async () => {
    const date = this.dailyChallengeRolloverTime()
    setTimeout(() => {
      this.rolloverDailyChallenge()
    }, date - Date.now())
  }

  dailyChallengeRolloverTime = () => {
    const date = new Date()
    date.setUTCHours(23,59,59,999)
    return date
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

async function dailySetup() {
  const q = Queries.getInstance()
  const daily = await q.getDailyChallenge()
  if (!daily)
    q.createDailyChallenge()
  q.setDailyChallengeTimer()
}
dailySetup()

module.exports = { Queries }
