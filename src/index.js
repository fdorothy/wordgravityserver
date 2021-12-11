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
  const leaders = await Queries.getInstance().getLeaderboard()
  console.log(leaders)
  res.render('index', { title: 'index', leaders: leaders.leaders })
});

module.exports = router;
