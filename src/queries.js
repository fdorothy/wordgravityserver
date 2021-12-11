const Leaderboard = require('./models/leaderboard.js')

class Queries {
  static getInstance() {
    if (!Queries.instance)
      Queries.instance = new Queries()
    return Queries.instance
  }

  getLeaderboard = async () => {
    let leaders = await Leaderboard.findOne()
    if (leaders == null) {
      leaders = new Leaderboard()
      await leaders.save()
    }
    return leaders
  }

  addScore = async (name, score) => {
    const leaderDoc = await this.getLeaderboard()
    const leaders = [...leaderDoc.leaders, {name, score}].sort((a, b) => b.score-a.score).slice(0, 5)
    leaderDoc.leaders = leaders
    await leaderDoc.save()
  }
}

module.exports = { Queries }
