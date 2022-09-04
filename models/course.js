const mongoose = require('mongoose')
const Schema = mongoose.Schema

const courseSchema = new Schema({
   title: { required: true, type: String },
   description: { required: true, type: String },
   tags: { required: true, type: Array },
   aid: { required: true, type: String },
   author: { required: true, type: String },
   image: { required: true, type: String },
   body: { required: true, type: Array },
   draft: { required: true, type: Boolean },
   views: { required: true, type: Number }
}, {timestamps: true})

const Course = mongoose.model('course', courseSchema)

module.exports = Course