if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const mongoose = require('mongoose')
const seeder = require('mongoose-seed')
const fs = require('fs')

seeder.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}, (res) => {
  seeder.loadModels([
    'src/models/Leaderboard.js'
  ])

  console.log('clearing models...')
  seeder.clearModels(['Leaderboard'], function() {
    console.log('models cleared, populating...')
    seeder.populateModels(data, function() {
      console.log('models populated, disconnecting')
      seeder.disconnect()
    })
  })
})

var data = [
  {
    'model': 'Leaderboard',
    'documents': [
      {
        'leaders': [
          { 'name': 'AAA', 'score': 5000 },
          { 'name': 'AAA', 'score': 4000 },
          { 'name': 'AAA', 'score': 3000 },
          { 'name': 'AAA', 'score': 2000 },
          { 'name': 'AAA', 'score': 1000 },
          { 'name': 'AAA', 'score': 500 },
          { 'name': 'AAA', 'score': 100 }
        ]
      }
    ]
  }
]
 
