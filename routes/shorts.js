const express = require('express')
const router = express.Router()
const Short = require('../models/shorts')
const Course = require('../models/course')
const User = require('../models/user')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')
const sections = require('./sections')
const { search, searchUser, searchOne, create, exists, validateId, removeMany, publish, draft, set } = require('../misc')
const { checkParamsId }  = require('../middleware/misc')

router.post('/create', auth.authVerify, async function (req, res) {
   try {
      // Validation
      const isValid = req.body?.title > '' && req.body?.description.length > '' && req.body?.coverImage > '' && req.body?.tags.length > 0 && Array.isArray(req.body?.tags)
      if (!isValid) return res.status(400).json({msg: "Data is invalid or incomplete"})
      
      // Check whether a short with the same title exists
      const titlePresent = await exists( Short, { title: req.body.title } ) 
      if (titlePresent) return res.status(400).json({msg: "A Short with this title already exists. Please choose another title and try again."})
      
      // Find the User Doc
      const user = await searchUser( req.authData.id )
      if (!validateId(user?.id)) return res.status(400).json({msg: "User is invalid."})
   
      // Create the new Short
      const result = await create( Short, {
         title: req.body.title,
         description: req.body.description,
         tags: req.body.tags,
         image: req.body.coverImage,
         draft: true, views: 0, body: [],
         aid: user.id, author: user.name
      } )

      res.json(result)
   }
   catch(e) { console.log(e) }
})

router.use(checkParamsId)

router.get('/drafts/:id', auth.authVerify, async function(req, res) {
   try {
      const field = {
         _id: req.params.id,
         aid: req.authData.id
      }

      const short = await searchOne( Short, field, {}, true )
      const user = await searchUser( req.authData.id )
      
      if (!short?._doc) return res.status(404).json({msg: "This draft does not exist."})

      res.json({
         ...short?._doc ?? {},
         author: user.name,
         author_pic: user.profile_pic
      })


   } catch (e) {
      console.log(e)
   }
})

router.delete('/delete/:id', auth.authVerify, async function (req, res) {
   try {
      const field = {
         aid: req.authData.id,
         _id: req.params.id
      }

      const result = await removeMany( Short, field )
      
      res.json(result)

   } catch (e) {
      console.log(e)
   }
})

router.post('/publish/:id', auth.authVerify, async function (req, res) {
   try{
      const result = await publish( Short, req.params.id, {aid: req.authData.id} )
      res.json(result)
   }
   catch(e) {console.log(e)}
})

router.post('/draft/:id', auth.authVerify, async function (req, res) {
   try{
      const result = await draft( Short, req.params.id, {aid: req.authData.id} )
      res.json(result)
   }
   catch(e) {console.log(e)}
})

router.post('/update/:id', auth.authVerify, async function (req, res) {
   try {
      // Validation
      const isValid = req.body?.title > '' && req.body?.description.length > '' && req.body?.coverImage > '' && req.body?.tags.length > 0 && Array.isArray(req.body?.tags)
      if (!isValid) return res.status(400).json({msg: "Data is invalid or incomplete"})

      const field = {
         title: req.body.title, description: req.body.description,
         image: req.body.coverImage, tags: [ ...req.body.tags ]
      }

      const result = set( Short, req.params.id, field, {aid: req.authData.id} )

      res.json(result)

   }
   catch(e) {console.log(e)}
})

router.get('/read/courses/:id', async (req, res) => {
   try {
      if(req.params?.id?.length !== 24) return res.sendStatus(403)

      const courses = await Course.find(
         { body: req.params.id }
      ).sort(
         { createdBy: -1 }
      )

      res.json({
         courses,
         count: courses.length
      })
   }catch(e) {
      console.log(e)
   }
})

router.get('/read/course/:id', async (req, res) => {
   try {
      if(req.params?.id?.length !== 24) return res.sendStatus(403)

      let course = {}

      if(req.query?.id?.length === 24) {
         course= await Course.findOne(
            { 
               body: req.params.id,
               _id: req.query.id
            },
         ).select(
            {body: 1}
         )
      } else {
         course = await Course.findOne(
            { body: req.params.id }
         ).sort(
            { createdAt: -1 }
         ).select(
            {body: 1}
         )
      }

      if (course?.id?.length!==24) return res.sendStatus(402)

      const shorts = await Short.find(
         {
            draft: false,
            _id: {
               $in: [ ...course.body ]
            }
         }
      ).select({
         title: 1
      })

      res.json({
         shorts: shorts,
         count: shorts.length
      })
   }catch(e) {
      console.log(e)
   }
})

router.get('/read/:id', async (req, res) => {
   try {
      req.app.use(auth.checkShortId)
      req.app.use(auth.checkShort)
      const short = await Short.findOne({_id: req.params.id, draft: false})
      const aidValid = short?.aid && short?.aid?.length === 24
      if(!aidValid) return res.sendStatus(404)
      const author = await User.findById(short.aid).select({name:1, profile_pic: 1})
      await Short.updateOne({
         _id: req.params.id,
         draft: false
      }, {
         $inc: {
            views: 1
         }
      })
      res.json({
         ...short._doc,
         author: author.name,
         author_pic: author.profile_pic,
      })
   } catch (e) {
      console.log(e)
   }
})


router.use('/section', sections)

module.exports = router