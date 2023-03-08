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

  validateApiKey = (key) => this.apiKey && this.apiKey.key === key

  getLeaderboard = async (_id) => await Leaderboard.findOne({_id})

  getGlobalLeaderboard = async () => await this.getLeaderboard('global')

  getDailyLeaderboard = async () => await this.getLeaderboard('daily')

  createDailyLeaderboard = async () => {
    const leaderboard = new Leaderboard({_id: 'daily', seed: this.randomSeed()})
    await leaderboard.save()
    return leaderboard
  }

  createGlobalLeaderboard = async () => {
    const leaderboard = new Leaderboard({_id: 'global', seed: -1})
    await leaderboard.save()
    return leaderboard
  }

  rolloverDailyLeaderboard = async () => {
    await Leaderboard.deleteMany({_id: 'daily'})
    await this.createDailyLeaderboard()
    setTimeout(this.setDailyLeaderboardTimer, 60)
  }

  setDailyLeaderboardTimer = async () => {
    const date = this.dailyLeaderboardRolloverTime()
    setTimeout(() => {
      this.rolloverDailyLeaderboard()
    }, date - Date.now())
  }

  dailyLeaderboardRolloverTime = () => {
    const date = new Date()
    date.setUTCHours(23,59,59,999)
    return date
  }

  createChallenge = async (user, seed, random) => {
    const challenge = new Challenge({players: [user], seed, random})
    await challenge.save()
    return challenge
  }

  getChallenge = async (challenge_id) => await Challenge.findById(challenge_id)

  getRandomChallenge = async (challenge_id) => await Challenge.findOne({random: true})

  getChallenges = async (user_id) => {
    const challenges = await Challenge.find({'players._id': user_id})
    return challenges
  }

  acceptChallenge = async (challenge_id, user) => {
    const challenge = await this.getChallenge(challenge_id)
    const player = challenge.players.find(x => x._id.toString() == user._id.toString())
    challenge.random = false
    if (!player)
      challenge.players.push({_id: user._id, name: user.name})
    await challenge.save()
  }

  destroyChallenge = async (challenge_id, user) => {
    const challenge = await this.getChallenge(challenge_id)
    const playerIndex = challenge.players.findIndex(x => x._id.toString() == user._id.toString())
    if (playerIndex < 0) {
      // no player found, just ignore
      console.log('no player found')
    } else {
      console.log('found the player')
      challenge.players.splice(playerIndex, 1)

      // if we were the last player, then delete the challenge
      if (challenge.players.length == 0) {
        await Challenge.deleteOne({_id: challenge_id})
      } else {
        console.log('saving')
        await challenge.save()
      }
    }
  }

  addChallengeScore = async (challenge, user, score, power) => {
    challenge.power = power
    const index = challenge.players.findIndex(x => x._id.toString() == user._id.toString())
    const player = challenge.players[index]
    console.log(JSON.stringify(challenge.players))
    console.log(user._id)
    console.log(player)
    if (player && challenge.turn == index) {
      player.score = score
      challenge.leaders = this.addScoreToLeaders(challenge.leaders, user, score)
      challenge.turn += 1

      // check if this is the end of the game, but only proceed
      //  if we have more than one person since we assume that
      //  the game isn't ready until we have a minimum of 2 players
      if (challenge.turn >= challenge.players.length && challenge.players.length > 1)
        this.finalizeChallenge(challenge)

      await challenge.save()
      return challenge
    } else {
      // fwd: player doesn't exist in challenge, throw some kind of error?
      return null
    }
  }

  finalizeChallenge = (challenge) => {
    // find the winning score
    let maxScore = 0
    for (let i=0; i<challenge.players.length; i++)
      if (maxScore < challenge.players[i].score)
        maxScore = challenge.players[i].score

    // tally wins and losses for each player
    for (let i=0; i<challenge.players.length; i++) {
      if (maxScore === challenge.players[i].score) {
        challenge.players[i].wins += 1
        // todo: send a GCM message to client that they won a challenge
      }
      else {
        challenge.players[i].losses += 1
        // todo: send a GCM message to client that they lost a challenge
      }
    }

    // reset the turn back to 0
    challenge.turn = 0
  }

  addScoreToLeaderboard = async (user, leaderboard_id, score) => {
    const leaderDoc = await this.getLeaderboard(leaderboard_id)
    const leaders = this.addScoreToLeaders(leaderDoc.leaders, user, score)
    leaderDoc.leaders = leaders
    await leaderDoc.save()
    return leaderDoc
  }

  addScoreToLeaders = (leaders, user, score) => {
    return [...leaders, {user, score}].sort((a, b) => b.score-a.score).slice(0, 10)
  }

  randomSeed = () => Math.floor(Math.random() * 4096 + 1)
}

async function dailySetup() {
  try {
    const q = Queries.getInstance()
    const daily = await q.getDailyLeaderboard()
    if (!daily)
      await q.createDailyLeaderboard()
    await q.setDailyLeaderboardTimer()
  } catch (err) {
    console.log(err)
  }
}
dailySetup()

async function globalSetup() {
  const q = Queries.getInstance()
  const leaderboard = await q.getGlobalLeaderboard()
  if (!leaderboard)
    q.createGlobalLeaderboard()
}
globalSetup()

module.exports = { Queries }
