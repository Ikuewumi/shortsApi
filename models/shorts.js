const mongoose = require('mongoose')
const Schema = mongoose.Schema

const shortContentSchema = new Schema({
   type: { required: true, type: String },
   content: { required: true, type: String },
   alt: String
})

const shortBodySchema = new Schema({
   title: String,
   contents: [ shortContentSchema ]
})

const shortSchema = new Schema({
   title: { required: true, type: String },
   description: { required: true, type: String },
   tags: { required: true, type: Array },
   author: { required: true, type: String },
   aid: { required: true, type: String },
   image: { required: true, type: String },
   body: { required: true, type: [ shortBodySchema ] },
   draft: { required: true, type: Boolean },
   views: { required: true, type: Number }
}, {timestamps: true})

const Short = mongoose.model('short', shortSchema)

module.exports = Short