// models/Admin.js
const mongoose = require('mongoose');

const { Schema } = mongoose;

const adminSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    trim: true },

  email: { 
    type: String,
    required: true,
    unique: true, 
    trim: true },

  password: { 
    type: String, 
    required: true },

  role: { 
    type: String, 
    default: 'admin' }
});

module.exports = mongoose.model('Admin', adminSchema);
