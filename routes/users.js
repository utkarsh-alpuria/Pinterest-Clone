const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/pinterest_db") //creating and connecting database(pinterest_db)
const userSchema = mongoose.Schema({ 
  username: String,
  fullname : String,
  email: String,
  password: String,
  profileImage: String,
  contact: Number,
  boards: {
    type: Array,
    default: []
  },
  posts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "posts"
  }]
})

userSchema.plugin(plm);

module.exports = mongoose.model("users", userSchema) // users collection