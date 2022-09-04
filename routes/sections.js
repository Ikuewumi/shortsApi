const express = require('express')
const router = express.Router()
const Short = require('../models/shorts')
const Course = require('../models/course')
const User = require('../models/user')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')
const {
   search, searchUser, searchOne,
   create, exists, validateId,
   removeMany, publish, draft, set 
} = require('../misc')
const { checkParamsId }  = require('../middleware/misc')

router.use(checkParamsId)

router.post('/create/:id', auth.authVerify, async function (req, res) {
   try {
      // validation
      const isValid = req.body?.title > '' && Array.isArray(req.body?.contents)
      if (!isValid) return res.status(400).json({
         msg: "A Section must have a Title and an Array of Contents"
      })

      const field = { _id: req.params.id, aid: req.authData.id, draft: true }
      const section = { title: req.body.title, contents: req.body?.contents }
      const update = { $push: { body: section } }
      const result = await Short.updateOne(field, update)

      res.json(result)

   }
   catch(e) {console.log(e)}

})

router.post('/read/:id', auth.authVerify, async function (req, res) {
   try {
      if (!validateId(req.body?.id)) return res.status(400).json({
         msg: "Section Body Id is invalid"
      })

      const field = { _id: req.params.id, aid: req.authData.id, "body.id": req.body.id, draft: true }
      const select = { body: 1 }
      const short = await searchOne( Short, field, select, true )
      const section = short.body.find(section => section["id"] === req.body.id)

      res.json(section)

   } catch(e) { console.log(e) }

})

router.delete('/delete/:id', auth.authVerify, async function (req, res) {
   try {
      if (!validateId(req.body?.id)) return res.status(400).json({
         msg: "Section Body Id is invalid"
      })

      const field = { _id: req.params.id, aid: req.authData.id, "body.id": req.body.id, draft: true }
      const update = {$pull: {body: {_id: req.body.id}}}
      const result = await Short.updateOne(field, update)

      res.json(result)

   }
   catch(e) {console.log(e)}
})

router.post('/update/:id', auth.authVerify, async function (req, res) {
   try {
      // validation
      if (!validateId(req.body?.id)) return res.status(400).json({
         msg: "Section Body Id is invalid"
      })
      const isValid = req.body?.title > '' && Array.isArray(req.body?.contents)
      if (!isValid) return res.status(400).json({
         msg: "A Section must have a Title and an Array of Contents"
      })


      const field = { _id: req.params.id, aid: req.authData.id, "body._id": req.body.id, draft: true }
      const section = { title: req.body.title, contents: req.body?.contents }
      const update = { $set: {"body.$": { ...section }}}
      const result = await Short.updateOne(field, update)

      res.json(result)

   }
   catch(e) {console.log(e)}
})

module.exports = router