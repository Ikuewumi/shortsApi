const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const Short = require('../models/shorts')
const Course = require('../models/course')
const {
   validateId,
   search, searchOne, searchId, searchUser, 
   set, setUser, setMany,
   removeMany
} = require('../misc')
const { checkParamsId } = require('../middleware/misc')

router.get('/profile', auth.authVerify, async function(req, res) {
   try {
      const user = await searchUser(req.authData.id)
      res.json(user)
   }
   catch(e) {console.log(e)}

})

router.get('/shorts/:id', async function ( req, res ) {
   try {
      req.app.use(checkParamsId)
      const page = (+req.query?.page > 0) ? (+req.query?.page - 1) : 0 
      const object = { aid: req.params.id }      
      const shorts = await search( Short, object, { createdAt: 1 }, page )
      res.json(shorts)
   }
   catch(e) {
      console.log(e)
   }
})

router.get('/courses/:id', async function ( req, res ) {
   try {
      req.app.use(checkParamsId)
      const page = (+req.query?.page > 0) ? (+req.query?.page - 1) : 0 
      const object = { aid: req.params.id }      
      const courses = await search( Course, object, { createdAt: 1 }, page, {body:1} )
      res.json(courses)
   }
   catch(e) {
      console.log(e)
   }
})

router.get('/drafts/shorts', auth.authVerify, async function ( req, res ) {
   try {
      const page = (+req.query?.page > 0) ? (+req.query?.page - 1) : 0 
      const object = { aid: req.authData.id }      
      const shorts = await search( Short, object, { createdAt: 1 }, page, {}, true )
      res.json(shorts)
   }
   catch(e) {
      console.log(e)
   }

})

router.get('/drafts/courses', auth.authVerify, async function ( req, res ) {
   try {
      const page = (+req.query?.page > 0) ? (+req.query?.page - 1) : 0 
      const object = { aid: req.authData.id }
      const courses = await search( Course, object, { createdAt: 1 }, page, {}, true )
      res.json(courses)
   }
   catch(e) {
      console.log(e)
   }

})

router.post('/profile', auth.authVerify, async(req, res) => {
   try {
      const required = req.body?.name && req.body?.description && req.body?.profile_pic && req.body?.cover_pic 
      if (!required) return res.sendStatus(402)

      const authorObject = { aid: req.authData.id }

      const userObject = {
         name: req.body.name,
         description: req.body.description,
         profile_pic: req.body.profile_pic,
         cover_pic: req.body.cover_pic,
      }

      const promises = [
         setUser(req.authData.id, userObject),
         setMany(Short, authorObject, {name: req.body.name}),
         setMany(Course, authorObject, {name: req.body.name})
      ]

      const result = await Promise.all(promises)

      res.json(result)
   } catch(e) {
      console.log(e)
   }


})


router.post('/delete/:id', auth.authVerify, async (req, res) => {
   try {
      const id = req.params.id ?? ''
      if(id.length !== 24) return res.sendStatus(400)
      if (req.authData.id !== id) return res.sendStatus(403)
      const promiseArray = [
         Course.deleteMany({aid: id}),
         Short.deleteMany({aid: id}),
         User.deleteOne({_id: id})
      ]
      const result = await Promise.all(promiseArray)
      res.json(result)
   } catch(e) {
      console.log(e)
   }
})

module.exports = router

