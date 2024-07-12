const mongoose = require('mongoose');

const uri = process.env.MONGO_URI

const db = mongoose.connect(uri).then(() => console.log('connected to database'))

module.exports = db