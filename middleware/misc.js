const { validateId } = require('../misc')
function checkParamsId (req, res, next) {
   const id = req.path.split('/').at(-1)
   if (!validateId(id)) return res.status(400).json({ msg: 'Invalid ID' })
   next()
}

module.exports = {
   checkParamsId
}