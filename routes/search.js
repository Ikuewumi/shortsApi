const router = require('express').Router()
const Short = require('../models/shorts')
const Course = require('../models/course')
const User = require('../models/user')
const { search } = require('../misc')
// const auth = require('../middleware/auth')

router.get('/shorts', async function (req, res) {
   const valid = req.query?.field > '' && req.query?.term > '' && req.query?.asc > ''

   if (!valid) return res.status(400).json({
      msg: "Please enter these query parameters: field, term"
   })

   const field = req.query.field
   const term = req.query.term
   const asc = req.query?.asc === '-1' ? -1 : 1
   const page = (+req.query?.page > 0) ? (+req.query?.page - 1) : 0 

   const regexify = (x = '') => {
      return { $regex: new RegExp(x, 'i') }
   }

   const search_ = { draft: false, }
   const sort = {}


   switch(field) {
      case 'title':
         search_.title = regexify(term)
         break;

      case 'author':
         search_.author = regexify(term)
         break;

      case 'tags':
         search_.tags = term
         break;

      default:
         return res.status(400).json({ msg: "You can only search for a title, tag or author" })
         break;
   }

   sort['createdAt'] = asc


   const shorts = await search(
      Short,
      search_, sort,
      page
   )

   res.json(shorts)

})

router.get('/courses', async function (req, res) {
   const valid = req.query?.field > '' && req.query?.term > '' && req.query?.asc > ''

   if (!valid) return res.status(400).json({
      msg: "Please enter these query parameters: field, term and asc"
   })

   const field = req.query.field
   const term = req.query.term
   const asc = req.query?.asc === '-1' ? -1 : 1
   const page = (+req.query?.page > 0) ? (+req.query?.page - 1) : 0 

   const regexify = (x = '') => {
      return { $regex: new RegExp(x, 'i') }
   }

   const search_ = { draft: false, }
   const sort = {}


   switch(field) {
      case 'title':
         search_.title = regexify(term)
         break;

      case 'author':
         search_.author = regexify(term)
         break;

      case 'tags':
         search_.tags = term
         break;

      default:
         return res.status(400).json({ msg: "You can only search for a title, tag or author" })
         break;
   }

   sort['createdAt'] = asc


   const courses = await search(
      Course,
      search_, sort,
      page, { body: 1 }
   )

   res.json(courses)

})


module.exports = router

