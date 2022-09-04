const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
   name: {
      required: true,
      type: String
   }
});

const Tag = mongoose.model('tag', tagSchema)

module.exports = Tag