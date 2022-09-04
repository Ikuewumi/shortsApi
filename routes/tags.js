const express = require('express')
const router = express.Router()
const Tag = require('../models/tags')
const tagController = require('../controllers/tags')

router.get('/', tagController.tags_find)

module.exports = router