require('dotenv').config()

const express = require('express')
const cors = require('cors');
const mongoose = require('mongoose')
const app = express();
const auth = require('./middleware/auth')
const user = require('./routes/user')
const tag = require('./routes/tags')
const shorts = require('./routes/shorts')
const course = require('./routes/course')
const message = require('./routes/message')
const search = require('./routes/search')
const pages = require('./routes/pages')
const bodyParser = require('body-parser')
const port = process.env.PORT || 4000;

// Database URI

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => {
      app.listen(port)
   })

app.use(cors())
app.options('*', cors())
app.use(bodyParser.json({ limit: '600kb' }))
// SignUp for new User
app.post('/signup', auth.authSignup, (req, res) => {
   res.status(200).json({
      message: "User Registered"
   })
})

// Login for Registered User
app.post('/login', auth.authLogin, (req, res) => {
   res.status(200).json({
      token: req.token
   })
})

app.use('/user', user)
app.use('/shorts', shorts)
app.use('/courses', course)
app.use('/message', message)
app.use('/search', search)
app.use('/pages', pages)
