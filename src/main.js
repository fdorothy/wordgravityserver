var moment = require('moment')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileupload = require('express-fileupload')
var crypto = require('crypto')
const ws = require('ws')

var app = express();
var server = require('http').Server(app)
const expressWs = require('express-ws')(app,server)

var indexRouter = require('./index');
var clientRouter = require('./client');

// set up a last resort error logger
process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
});

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.moment = moment
app.locals.ts = (t) => moment(t).utc().format()
app.use((req, res, next) => {
  res.locals.options = {
    version: '0.0.1',
    user: {},
  }
  res.locals.messages = {}
  next()
})

// stick our ws server into the routers so we can use it to broadcast later
app.use((req, res, next) => {
  res.expressWs = expressWs
  next()
})

app.use(express.json());
app.use(fileupload());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use(logger('dev'));

app.use('/', indexRouter);
app.use('/api', clientRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err.message)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app, server};
