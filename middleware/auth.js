require('dotenv').config()
const User = require('../models/user')
const Short = require('../models/shorts')
const Course = require('../models/course')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// regex object
const regexObject = {
   name: /^([a-zA-Z]+) ([a-zA-Z]+)$/,
   password: /^[\w\W]{6,}$/,
   email: /^([a-z\d\.]+)@([a-z\d\-]+)\.([a-z]{2,8})((\.)[a-z]{2,8})?$/
}

async function checkShortAuthor(req, res, next) {
   const id = req.params.id
   const isValid = await Short.exists({ _id: id, aid: req.authData.id })
   if(!isValid) return res.sendStatus(403)
   next()
}

async function checkShortId(req, res, next) {
   const id = req.params?.id ?? ''
   if(id.length !== 24) return res.sendStatus(400)
   next()
}

async function checkSectionId(req, res, next) {
   const id = req.body?.id ?? ''
   if(id.length !== 24) return res.sendStatus(400)
   next()
}

async function checkSection(req, res, next) {
   const id = req.body.id
   const section = await Short.exists({ _id: req.authData.id, draft: true, "body._id": id })
   if(!section) return res.sendStatus(404)
   next()
}

async function checkCourseId(req, res, next) {
   const id = req.params?.id ?? ''
   if(id.length !== 24) return res.sendStatus(400)
   next()
}

async function checkCourseAuthor(req, res, next) {
   const isValid = await Course.exists({ _id: req.params.id, aid: req.authData.id })
   if(!isValid) return res.sendStatus(404)
   next()
}

async function checkDraftedCourse(req, res, next) {
   const id = req.params.id
   const course = await Course.exists({ _id: id, draft: true })
   if(!course) return res.sendStatus(404)
   next()
}

async function checkCourse(req, res, next) {
   const id = req.params.id
   const course = await Course.exists({ _id: id, draft: false })
   if(!course) return res.sendStatus(404)
   next()
}


async function checkShort(req, res, next) {
   const id = req.params.id
   const short = await Short.exists({ _id: id, draft: false })
   if(!short) return res.sendStatus(404)
   next()
}

async function checkDraftedShort(req, res, next) {
   const id = req.params.id
   const short = await Short.exists({ _id: id, draft: true })
   if(!short) return res.sendStatus(404)
   next()
}

async function authVerifyUser(req, res, next) {
   const id = req.params?.id ?? ''
   if (id.length !== 24) return res.sendStatus(404)
   const aid = await Short.exists({ _id: id, aid: req.authData.id })
   if(!aid) return res.status(403)
   next()
}

async function authVerifyShortDraft(req, res, next) {
   const id = req.params?.id ?? ''
   if (id.length !== 24) return res.sendStatus(404)
   const aid = await Short.exists({ _id: id, aid: req.authData.id, draft: true })
   if(!aid) return res.status(403)
   next()
}

async function authVerify(req, res, next) {
   const bearerTokenPresent = req.headers && req.headers['authorization'] && req.headers['authorization'] > '' && (req.headers['authorization'].split(' ')).length === 2 && req.headers['authorization'] > 'Bearer '

   if(!bearerTokenPresent) {return res.status(403).json({message: "No Valid Token"})}
   const bearerToken = (req.headers['authorization'].split(' '))[1]

   jwt.verify(bearerToken, process.env.SECRET_KEY, async (err, authData) => {
      if (err) { return res.sendStatus(403) }
      const userData = await User.exists({ id: authData.id })
      if (!userData) {return res.status(404).json({"message": "User not found in database"})}
      req.authData = authData
      next()
   })
}

// login middleware
async function authLogin (req, res, next) {
   if (!req?.body || !req?.body?.email || !req?.body?.password ) {
      return res.sendStatus(403)
   }
   if (!regexValidate('', req.body.email, req.body.password, false)) { return res.status(403).json({ message:"Please Send In Valid Parameters" }) } 
   const currentUser = await User.find({email: req.body.email})
   if (currentUser.length === 0) { return res.status(404).json({ message:"No User Present" })}
   const passwordIsValid = await bcrypt.compare(req.body.password, currentUser[0].password)
   if (!passwordIsValid) { return res.sendStatus(403) }
   const userObject = {
      id: currentUser[0].id,
      email: currentUser[0].email
   }
   jwt.sign(userObject, process.env.SECRET_KEY, (err, authData) => {
      if (err) { return res.sendStatus(503) }
      req.token = authData
      next()
   })



}

// signup middleware
async function authSignup (req, res, next) {
   if (!req?.body || !req?.body?.email || !req?.body?.password || !req?.body?.name ) {
      return res.sendStatus(403)
   }
   const signedInUser = await User.find({email: req.body.email})
   if (signedInUser.length !== 0) { return res.status(403).json({ message:"User Already Present" })
   }
   if (!regexValidate(req.body.name, req.body.email, req.body.password, true)) { return res.status(403).json({ message:"Please Send In Valid Parameters" }) } 
   const hashedPassword = await bcrypt.hash(req.body.password,10)
   const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
   })

   const result = await newUser.save()
   next()

}

// Validate Fields with regex
function regexValidate(name='', email='', password='', bool=true) {
   let testResult = null
   if (bool) {
      testResult = regexObject.name.test(name) && regexObject.password.test(password) && regexObject.email.test(email)
   } else {
      testResult = regexObject.password.test(password) && regexObject.email.test(email)
   }
   return testResult
}
module.exports = {
   authLogin,
   authSignup,
   authVerify,
   authVerifyUser,
   authVerifyShortDraft,
   checkShortAuthor,
   checkShortId,
   checkShort,
   checkDraftedShort,
   checkSectionId,
   checkSection,
   checkCourse,
   checkCourseAuthor,
   checkDraftedCourse,
   checkCourseId
}