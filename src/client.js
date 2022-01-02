var package = require('../package.json');
var jwt = require('jsonwebtoken')
var express = require('express');
var router = express.Router();
const session = require('express-session')
const archiver = require('archiver')
const jose = require('jose')
const fs = require('fs')
const mongoose = require('mongoose')
const Leaderboard = require('./models/leaderboard.js')
const User = require('./models/user.js')
const { Queries } = require('./queries')

const queries = Queries.getInstance()

router.use(async function(req, res, next) {
  const apiKey = req.get("x-wordgravity-key")
  const user_id = req.get("x-wordgravity-user")
  if (user_id && user_id.length > 3) {
    req.user = await User.findById(user_id)
  }
  if (apiKey !== null && queries.validateApiKey(apiKey)) {
    next()
  } else {
    res.status(400).send("Error: Invalid API key")
  }
})

router.post('/register', async function(req, res) {
  res.json(await queries.register(req.body.name))
})

router.post('/user', async function(req, res) {
  const { name } = req.body
  if (req.user) {
    req.user.name = name
    const user = await req.user.save()
    res.json(user)
  }
})

/* GET /api/leaderboard/_id. */
router.get('/leaderboard/:_id', async function(req, res, next) {
  const leaders = await queries.getLeaderboard(req.params._id)
  res.json(leaders)
});

// POST /api/stats - post a high score to a leaderboard
router.post('/leaderboard/:_id/stats', async function(req, res) {
  console.log('posting stats')
  const leaders = await queries.addScoreToLeaderboard(req.user, req.params._id, req.body.score)
  res.json(leaders)
})

/* POST /api/challenge - creates a new challenge, returns the challenge id */
router.post('/challenge', async function(req, res, next) {
  console.log(req.user)
  const challenge = await queries.createChallenge(req.user, req.body.seed, req.body.random)
  res.json(challenge)
})

/* GET /api/challenge/random - gets a random challenge without a partner */
router.get('/challenge/random', async function(req, res, next) {
  const challenge = await queries.getRandomChallenge()
  res.json(challenge)
})

/* GET /api/challenge - gets information about a challenge */
router.get('/challenge/:_id', async function(req, res, next) {
  const { _id } = req.params
  challenge = await queries.getChallenge(_id)
  res.json(challenge)
});

/* GET /api/challenge - gets information about a challenge */
router.get('/challenges', async function(req, res, next) {
  const challenges = await queries.getChallenges(req.user._id)
  res.json({challenges})
});

// POST /api/challenge/_id/stats - post a high score for a specific challenge
router.post('/challenge/:_id/stats', async function(req, res) {
  let challenge = await queries.getChallenge(req.params._id)
  challenge = await queries.addChallengeScore(challenge, req.user, req.body.score, req.body.power || 0)
  res.json(challenge)
})

// POST /api/challenge/_id/stats - post a high score for a specific challenge
router.post('/challenge/:_id/accept', async function(req, res) {
  challenge = await queries.acceptChallenge(req.params._id, req.user)
  res.json(challenge)
})

// POST /api/challenge/_id/stats - post a high score for a specific challenge
router.post('/challenge/:_id/destroy', async function(req, res) {
  challenge = await queries.destroyChallenge(req.params._id, req.user)
  res.json(challenge)
})

// catch 404 and forward to error handler
router.use(function(req, res, next) {
  next();
});

// error handler
router.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message)
  console.log(err)
  console.log(err.stack)
});

module.exports = router;
