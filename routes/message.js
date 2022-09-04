const express = require('express')
const Message = require('../models/message')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/', async (req, res) => {
   try {
      const message = await Message.find().limit(1)
      res.json({
         ...(message??{})
      })
   }
   catch(e) {
      console.log(e)
   }
})

router.post('/', auth.authVerify, async (req, res) => {
   try {
      if (req.body?.message < '') return res.sendStatus(404)
      const message = await Message.updateOne({}, {
         $set: {
            message: req.body.message
         }
      })

      res.status(200).json({
         res: "Message Set"
      })
   }
   catch(e) {
      console.log(e)
   }
})

module.exports = router

