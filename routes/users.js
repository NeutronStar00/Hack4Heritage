const mongoose = require('mongoose')

mongoose.set('strictQuery', false) // kuch or query property daal skte h pr agr true kr de to kuch or property nhi daal skte
// mongoose.connect('mongodb://127.0.0.1:27017/googleoauth')
mongoose.connect("mongodb://127.0.0.1:27017/bugbusters")
var userSchema = mongoose.Schema({
  name: String,
  email: String,
})
module.exports = mongoose.model('user', userSchema);