const express = require('express')
const router = express.Router()
const Short = require('../models/shorts')
const Course = require('../models/course')
const User = require('../models/user')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')

router.get('/', async (req, res) => {
   try {
      
      const data = await Course.find({ draft: false }).limit(10).sort({ createdAt: -1 })
      const count = await Course.find({ draft: false }).count()
      
      res.json({
         data,
         count
      })
      
   }
   catch(e) {
      
      console.log(e)
   
   }

})

router.get('/read/:id', async (req, res) => {

   try {

      req.app.use(auth.checkCourseId)
      if(req.params?.id.length !== 24) return res.sendStatus(400)
      const courseData = await Course.findOne({_id: req.params.id, draft: false })
      if (courseData?.id?.length !== 24) return res.sendStatus(401)
      const author = await User.findOne({_id: courseData.aid}).select({name:1, profile_pic: 1})
      if (author?.id?.length !== 24) return res.sendStatus(400)
      const shorts = await Short.find({
         _id: {
            $in: [ ...courseData.body ]
         },
         draft: false
      }).select({
         title: 1,
         author: 1,
         aid: 1,
         image: 1,
         createdAt: 1,
         description: 1
      })

      res.json({
         metadata: {
            author: author.name,
            author_pic: author.profile_pic,
            ...courseData._doc,
         },
         shorts: shorts,
         count: shorts.length
      })
   
   }
   catch (e) {
      console.log(e)
   }

})

router.post('/create', auth.authVerify, async (req, res) => {

   try {

      const isValid = req.body?.title > '' && req.body?.description > '' && req.body?.coverImage > '' && Array.isArray(req.body?.tags) 
      
      if (!isValid) return res.sendStatus(400)

      const userData = await User.findById(req.authData.id).select({ name: 1 })

      const titlePresent = await Course.findOne({ title: req.body.title })
      if(titlePresent) return res.sendStatus(400)

      const newCourse = new Course({
         title: req.body.title, description: req.body.description,
         aid: req.authData.id, author: userData.name,
         image: req.body.coverImage, tags: [ ...req.body.tags ],
         draft: true, body: [], views: 0
      })
      
      const course = await newCourse.save()
      
      res.json(course)
      
   }
   catch(e) {

      console.log(e)
   
   }

})

router.post('/add/:id', auth.authVerify, async (req, res) => {

   req.app.use(auth.checkCourseId)
   req.app.use(auth.checkDraftedCourse)
   if(req.params?.id.length !== 24) return res.sendStatus(400)
   const validArray = Object.keys(req.body).indexOf('shorts') !== -1 && req.body?.shorts && Array.isArray(req.body.shorts)
   if(!validArray) return res.sendStatus(400)
   const isValid = req.body.shorts.find(short => typeof(short) !== 'string' && short.length !== 24 )
   if (isValid) return res.sendStatus(402)
   const shorts = await Short.find({
      _id: {
         $in: [ ...req.body.shorts ]
      },
      draft: false, aid: req.authData.id
   }).select({
      title: 1
   })

   if (shorts.length !== req.body.shorts.length) return res.sendStatus(400)

   const updateObject = {
      $set: {
         body: req.body.shorts
      }
   }

   const result = await Course.updateOne({ _id: req.params.id, aid: req.authData.id, draft: true }, updateObject)

   return res.json(result)
})

router.post('/update/:id', auth.authVerify, async (req, res) => {

   req.app.use(auth.checkCourseId)
   req.app.use(auth.checkDraftedCourse)

   const isValid = req.body?.title > '' && req.body?.description.length >= 30 && req.body?.coverImage > '' && req.body?.tags.length > 0 && Array.isArray(req.body?.tags)

   if (!isValid) return res.sendStatus(400)

   const updateObject = {
      $set: {
         title: req.body.title, description: req.body.description,
         image: req.body.coverImage, tags: [ ...req.body.tags ]
      }
   }

   const course = await Course.updateOne({ _id: req.params.id, aid: req.authData.id, draft: true }, updateObject)

   res.json(course)

})

router.get('/drafts', auth.authVerify, async (req, res) => {

   const drafts = await Course.find({aid: req.authData.id, draft: true}).sort({createdAt: -1}).limit(10)
   const count = await Course.find({aid: req.authData.id, draft: true}).count()

   res.json({
      data: drafts,
      count: count
   })


})

router.get('/drafts-short/:id', auth.authVerify, async (req, res) => {

   try {

      req.app.use(auth.checkCourseId)
      req.app.use(auth.checkDraftedCourse)
      if(req.params?.id.length !== 24) return res.sendStatus(400)


      const draft = await Course.findOne({_id: req.params.id, aid: req.authData.id, draft: true})
      if(!draft) return res.sendStatus(404)

      res.json({
         ...draft._doc
      })
   
   }
   catch (e) {

      console.log(e)
   
   }

})

router.get('/drafts/:id', auth.authVerify, async (req, res) => {

   try {

      req.app.use(auth.checkCourseId)
      req.app.use(auth.checkDraftedCourse)
      if(req.params?.id.length !== 24) return res.sendStatus(400)


      const draft = await Course.findOne({_id: req.params.id, aid: req.authData.id, draft: true})
      const author = await User.findById(req.authData.id).select({name:1, profile_pic: 1})
      // console.log(author)
      const shorts = await Short.find({
         aid: req.authData.id,
         _id: {
            $in: [...draft.body]
         }  
      }).select({
         title: 1,
         author: 1,
         aid: 1,
         image: 1,
         createdAt: 1,
         description: 1
      })

      res.json({
         metadata: {
            ...draft._doc,
            name: author.name,
            author_pic: author.profile_pic
         },
         shorts: shorts
      })
   
   }
   catch (e) {

      console.log(e)
   
   }

})

router.get('/edit-page/:id', auth.authVerify, async(req, res) => {
   try {
      req.app.use(auth.checkCourseId)
      req.app.use(auth.checkDraftedCourse)
      req.app.use(auth.checkCourseAuthor)
      if(req.params?.id.length !== 24) return res.sendStatus(400)
      const courseData = await Course.findOne({_id: req.params.id, draft: true})
      
      const shorts = await Short.find({
         _id: {
            $in: [ ...courseData.body ]
         },
         draft: false, aid: req.authData.id
      }).select({
         title: 1, author: 1, aid: 1,
         description: 1, tags: 1, image: 1
      }).limit(200)

      const published = await Short.find({
         draft: false, aid: req.authData.id,
         _id: {
            $nin: [ ...courseData.body ]
         }
      }).select({
         title: 1, author: 1, aid: 1,
         description: 1, tags: 1, image: 1
      }).limit(200)

      res.json({
         data: courseData,
         courseShorts: shorts,
         shorts: published
      })



   }
   catch(e) {
      console.log(e)
   }
})


router.post('/publish/:id', auth.authVerify, async (req, res) => {
   try {

      req.app.use(auth.checkCourseId)

      const result = await Course.updateOne(
         {
            _id: req.params.id,
            aid: req.authData.id,
            draft: true
         },
         {
            $set: {
               draft: false
            }
         }
      )

      res.json(result)

   } catch(e) {
      console.log(e)
   }


})

router.post('/draft/:id', auth.authVerify, async (req, res) => {
   try {

      req.app.use(auth.checkCourseId)
      req.app.use(auth.checkDraftedCourse)
      req.app.use(auth.checkCourseAuthor)

      const result = await Course.updateOne(
         {
            _id: req.params.id,
            aid: req.authData.id,
            draft: false
         },
         {
            $set: {
               draft: true
            }
         }
      )

      res.json(result)

   } catch(e) {
      console.log(e)
   }


})


module.exports = router