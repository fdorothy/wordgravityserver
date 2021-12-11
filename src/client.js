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

router.use(function(req, res, next) {
  const apiKey = req.get("x-wordgravity-key")
  if (apiKey !== null && Queries.getInstance().validateApiKey(apiKey)) {
    next()
  } else {
    res.status(400).send("Error: Invalid API key")
  }
})

/* GET /api/leaderboard. */
router.get('/leaderboard', async function(req, res, next) {
  const leaders = await Queries.getInstance().getLeaderboard()
  res.json(leaders.leaders.map(x => {
    return {'name': x.name, 'score': x.score}
  }))
});

router.post('/stats', async function(req, res) {
  console.log(req.body)
  await Queries.getInstance().addScore(req.body.name, req.body.score)
  res.send('ok')
})

// catch 404 and forward to error handler
router.use(function(req, res, next) {
  next(createError(404));
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
