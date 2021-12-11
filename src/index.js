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

/* GET home page. */
router.get('/', async function(req, res, next) {
  const leaders = await Leaderboard.find()
  console.log(leaders)
  res.render('index', { title: 'index', leaders: leaders[0].leaders })
});

module.exports = router;
