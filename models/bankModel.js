// models/BankAccount.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const bankAccountSchema = new Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true },

  ifscCode: { 
    type: String, 
    required: true },

  branchName: { 
    type: String, 
    required: true },

  bankName: { 
    type: String, 
    required: true },

  accountNumber: { 
    type: String, 
    required: true, 
    unique: [true,"Account already registered"] },

  accountHolderName: { 
    type: String, 
    required: true }
});


module.exports = mongoose.model('BankAccount', bankAccountSchema);
