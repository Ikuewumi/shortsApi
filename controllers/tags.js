const Tag = require('../models/tags')

const tags_find = async (req, res) => {
   try {
      const dbTags = (await Tag.find()) ?? []
      if (dbTags.length <= 0) {
         return res.status(404).json({
            message: 'No tags found'
         })
      } else {
         const tags = dbTags.map(tag => tag.name)
         res.json({
            tags
         })
      }
   } catch(e) {
      console.log(e)
   }
}

module.exports = {
   tags_find
}