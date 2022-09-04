const express = require('express')
const router = express.Router()
const Short = require('../models/shorts')
const Course = require('../models/course')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { search, searchOne, searchId, searchUser, validateId } = require('../misc')

router.get('/', async function(req, res) {
   try {
      const shorts = await search( Short, {}, { createdAt: -1 }, 0 )
      const courses = await search( Course, {}, { createdAt: -1 }, 0, { body: 1 } )
      res.json({
         shorts,
         courses,
         featured: shorts?.items[0] ?? {}
      })
      
   }
   catch(e) {
      console.log(e)
   }
})

router.get('/home', async function (req, res) {
   res.redirect('/')
})

router.get('/shorts', async function (req, res) {
   try {
      const page = (+req.query?.page > 0) ? (+req.query?.page - 1) : 0
      const shorts = await search( Short, {}, { createdAt: 1 }, page )
      res.json(shorts)
   }
   catch (e) { console.log(e) }
})

router.get('/drafts/shorts/:id', auth.authVerify, async function (req, res) {
   try {
      const field = {
         aid: req.authData.id,
         _id: req.params.id
      }
   
      const short = await searchOne( Short, field, {body: 1}, true )
   
      res.json(short)

   }
   catch(e) { console.log(e) }

})

router.get('/courses', async function (req, res) {
   try {
      const page = (+req.query?.page > 0) ? (+req.query?.page - 1) : 0 
      const courses = await search( Course, {}, { createdAt: 1 }, page, { body: 1 } )
      res.json(courses)
   }
   catch (e) { console.log(e) }
})

router.get('/profile', auth.authVerify, async function (req, res) {
   try {
      const authorObject = { aid: req.authData.id }

      const shorts = await search( Short, authorObject, { createdAt: 1 }, 0 )
      const courses = await search( Course, authorObject, { createdAt: 1 }, 0, { body: 1 } )

      const draftedShorts = await search( Short, authorObject, { createdAt: 1 }, 0, {}, true )
      const draftedCourses = await search( Course, authorObject, { createdAt: 1 }, 0, { body: 1 }, true )

      const user = await searchUser( req.authData.id )

      res.json({
         user,
         published: {
            shorts,
            courses
         },
         drafts: {
            shorts: { ...draftedShorts },
            courses: { ...draftedCourses },
         }
      })
   }
   catch (e) { console.log(e) }
})

router.get('/user/:id', async function (req, res) {
   try {
      if (!validateId(req.params.id)) return res.status(400).json({ msg: 'Invalid ID' })

      const object = { aid: req.params.id }

      const user = await searchUser( req.params.id )
      const shorts = await search( Short, object, { createdAt: 1 }, 0 )
      const courses = await search( Course, object, { createdAt: 1 }, 0, { body: 1 } )

      res.json({
         user, shorts, courses
      })


   }
   catch (e) { console.log(e) }
})  
   

module.exports = router