const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    trim: true },

  email: { 
    type: String, 
    required: true, 
    unique: [true,"User email already registered"], 
    trim: true },

  password: { 
    type: String, 
    required: [true,"Please add user password"] }

});

module.exports = mongoose.model('User', userSchema);
