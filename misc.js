const Short = require('./models/shorts')
const User = require('./models/user')
async function search (db=Short, field = {}, sort = {}, page = 0, select = {}, draft = false ) {
   const items = await db
      .find({draft, ...field})
      .sort({...sort})
      .skip(page * 10)
      .limit(10)
      .select({
         title: 1, author: 1, aid: 1, description: 1, tags: 1, image: 1, createdAt: 1, updatedAt: 1,
         views: 1, ...select
      })

   const count = await db
      .find({draft, ...field})
      .count()

   return { items, count }
}

async function exists(db=Short, field = {}) {
   const result = await db
      .exists({...field})
   
   return result
   
}

async function searchOne(db=Short, field = {}, select = {}, draft=false) {
   const result = await db
      .findOne({draft, ...field})
      .select({
         title: 1, author: 1, aid: 1, description: 1, tags: 1, image: 1, createdAt: 1, updatedAt: 1,
         views: 1, ...select
      })
   
   return result
   
}


async function set(db=Short, id, data = {}, field = {}) {
   await checkId(id)
   const result = await db
      .updateOne(
         {_id: id, draft: true, ...field},
         {$set: data}
      )
   return result
   
}

async function create(db=Short, data = {}) {
   const newDoc = new db(data)
   const result = newDoc.save()
   return result
   
}

async function setMany(db=Short, field = {}, data = {}) {
   const result = await db
      .updateMany(
         {...field},
         {$set: data}
      )
   return result
   
}

async function setUser(id, data = {}) {
   await checkId(id)
   const result = await User
      .updateOne(
         {_id: id},
         {$set: data}
      )
   return result
   
}

async function searchId (db=Short, id, draft=true) {
   await checkId(id)
   const data = await db
      .findOne({ _id: id, draft })

   return data
}

async function searchUser (id) {
   await checkId(id)
   const data = await User
      .findOne({ _id: id })
      .select({
         name: 1, email: 1, description: 1, profile_pic: 1, cover_pic: 1, createdAt: 1
      })

   return data
}

async function checkId (id) {
   const validId = typeof(id) === 'string' && id.length === 24
   if(validId) return Promise.resolve(id)
   return Promise.reject('Id is not valid')
}

function validateId (id) {
   const validId = typeof(id) === 'string' && id.length === 24
   return validId
}

async function draft (db=Short, id, field = {}) {
   await checkId(id)
   const result = await db
      .updateOne({_id: id, draft: false, ...field }, {$set: {draft: true}})

   return Promise.resolve(result)
}

async function publish (db=Short, id, field = {}) {
   await checkId(id)
   const result = await db
      .updateOne({_id: id, draft: true, ...field }, {$set: {draft: false}})

   return Promise.resolve(result)
}


async function removeOne (db=Short, id) {
   await checkId(id)
   const result = await db
      .deleteOne({_id: id, draft: true })

   return Promise.resolve(result)
}

async function removeMany (db=Short, field={}) {
   const result = await db
      .deleteMany({ ...field })
   return Promise.resolve(result)
}


module.exports = {
   checkId, validateId,

   search, searchId, searchUser, searchOne,

   removeOne, removeMany,

   draft, publish,

   set, setUser, setMany,

   create, exists
}