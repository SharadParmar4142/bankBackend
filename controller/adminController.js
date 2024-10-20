const express=require("express");
const asyncHandler=require("express-async-handler");
const Admin=require("../models/adminModel.js");  
const bcrypt=require("bcrypt")
const BankAccount = require('../models/bankModel');
const User=require("../models/userModels.js")

// @desc    Register a Admin
// @route   POST /api/admin/register
// @access  Public

const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('All fields are mandatory');
  }

  const userAvailable=await Admin.findOne({email}) //using .findOne we get the same email and if it's true then the user already present

  if (userAvailable) {
    res.status(400);
    throw new Error('Admin already exists');
  }
          //Creating a new user
    // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = await Admin.create({
        username,
        email,  
        password:hashedPassword 
    });
    
    console.log(`Admin created ${newAdmin}`);

   //Sending information to the useruser but not sharing the password
    if(newAdmin){
        res.status(200).json({_id:newAdmin.id,email:newAdmin.email, message: 'Admin registered successfully'});
    }
    else{
        res.status(400);
        throw new Error("Admin data not valid");
    }

});

// @desc    Login a Admin
// @route   POST /api/admin/login
// @access  Public
const jwt = require('jsonwebtoken');

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        res.status(400);
        throw new Error('All fields are mandatory');
    }

    //Comparing the password recieved from the user and password stored in database 
    const admin = await Admin.findOne({ email });
    if(admin && (await bcrypt.compare(password,admin.password))){

        const accessToken=jwt.sign({
            admin:{
                username:admin.username,
                email:admin.email,
                id:admin.id,
                role: admin.role 
            }
        },
        //Fetching accessTokenSecret from the .env file
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"1h"
        }
        )

        res.status(200).json({accessToken, message: 'Login successful'});
    }
    else{
        res.status(401);
        throw new Error("Credentials not valid");
    }
});

// @desc    View All Users' Bank Information
// @route   GET /api/admin/users/bank-info
// @access  Private (Admin only)
const getAllUsersBankInfo = asyncHandler(async (req, res) => {
  const bankAccounts = await BankAccount.find().populate('user', 'username email');

  // Create a mapping of users to their bank accounts
  const userBankInfoMap = {};

  bankAccounts.forEach(account => {
      const userId = account.user._id.toString(); // Make sure to convert to string for proper comparison
      if (!userBankInfoMap[userId]) {
          userBankInfoMap[userId] = {
              username: account.user.username,
              email: account.user.email,
              accounts: [] // Initialize accounts array
          };
      }
      userBankInfoMap[userId].accounts.push(account); // Add the bank account to the user's account list
  });

  // Convert the map back to an array
  const formattedResponse = Object.values(userBankInfoMap);

  res.json(formattedResponse); // Send all users with their bank accounts
});


// @desc    Search Users by Name or Bank Details
// @route   GET /api/admin/search
// @access  Private (Admin only)
const searchUsers = asyncHandler(async (req, res) => {
  const { username, bankName, accountNumber, email } = req.query;
  console.log('Search Parameters:', req.query);

  // Create an empty query object for the BankAccount search
  const query = {};

  // If username is provided, use it to search in the User collection
  if (username) query['user.username'] = new RegExp(username, 'i');
  if (bankName) query.bankName = new RegExp(bankName, 'i');
  if (accountNumber) query.accountNumber = accountNumber;

  // If email is provided, find the corresponding user first
  let user;
  if (email) {
      user = await User.findOne({ email: new RegExp(email, 'i') }); // Find the user by email
      if (!user) {
          return res.status(404).json({ message: 'No matching records found for this email' });
      }
      query.user = user._id; // Add user ID to the query for bank accounts
  }

  console.log('Query:', query);

  const bankAccounts = await BankAccount.find(query).populate('user', 'username email');

  if (!bankAccounts.length) {
      return res.status(404).json({ message: 'No matching records found' });
  }

  res.json(bankAccounts); // Send filtered results
});

module.exports={loginAdmin, registerAdmin,getAllUsersBankInfo,searchUsers};