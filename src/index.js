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
const { Queries } = require('./queries')

/* GET home page. */
router.get('/', async function(req, res, next) {
  const globalLeaderboard = await Queries.getInstance().getGlobalLeaderboard()
  const dailyLeaderboard = await Queries.getInstance().getDailyLeaderboard()
  const dailyRolloverTime = Queries.getInstance().dailyLeaderboardRolloverTime()
  res.render('index', { title: 'index', globalLeaderboard, dailyLeaderboard, dailyRolloverTime })
});

module.exports = router;
