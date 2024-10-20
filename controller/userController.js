const express = require("express");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModels.js");
const BankAccount = require('../models/bankModel.js');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// @desc    Register a User
// @route   POST /api/user/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('All fields are mandatory');
  }

  // Check if the user already exists
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword
  });

  console.log(`User created ${newUser}`);

  // Send response without sharing the password
  if (newUser) {
    res.status(201).json({
      _id: newUser.id,
      email: newUser.email,
      message: 'User registered successfully'
    });
  } else {
    res.status(400);
    throw new Error("User data not valid");
  }
});

// @desc    Login a User
// @route   POST /api/user/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('All fields are mandatory');
  }

  // Find the user by email
  const user = await User.findOne({ email });

  // Compare password
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      accessToken
    });
  } else {
    res.status(401);
    throw new Error("Credentials not valid");
  }
});

// @desc    Add Bank Account
// @route   POST /api/user/login/bank/add
// @access  Private
const addBankAccount = asyncHandler(async (req, res) => {
  const { ifscCode, branchName, bankName, accountNumber, accountHolderName } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!ifscCode || !branchName || !bankName || !accountNumber || !accountHolderName) {
    res.status(400);
    throw new Error('All fields are mandatory');
  }

  // Check if the bank account already exists
  const accountAvailable = await BankAccount.findOne({ accountNumber });
  if (accountAvailable) {
    res.status(400);
    throw new Error('Account already exists');
  }

  // Create new bank account
  const newBankAccount = await BankAccount.create({
    user: userId,
    ifscCode,
    branchName,
    bankName,
    accountNumber,
    accountHolderName,
  });

  res.status(201).json({ message: 'Bank account added successfully' });
});

// @desc    Get Bank Accounts
// @route   GET /api/user/bank
// @access  Private
const getBankAccounts = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const bankAccounts = await BankAccount.find({ user: userId });
  res.status(200).json(bankAccounts);
});

// @desc    Edit Bank Account
// @route   PUT /api/user/login/bank/:id
// @access  Private
const editBankAccount = asyncHandler(async (req, res) => {
  const { ifscCode, branchName, bankName, accountHolderName } = req.body;
  const userId = req.user.id;
  const accountNumber = req.params.id;

  // Find the bank account by account number and userId
  const bankAccount = await BankAccount.findOne({ accountNumber, user: userId });
  if (!bankAccount) {
    res.status(404);
    throw new Error('Bank account not found');
  }

  // Update the bank account fields
  if (ifscCode) bankAccount.ifscCode = ifscCode;
  if (branchName) bankAccount.branchName = branchName;
  if (bankName) bankAccount.bankName = bankName;
  if (accountHolderName) bankAccount.accountHolderName = accountHolderName;

  // Save the updated bank account
  try {
    await bankAccount.save();
    res.status(200).json({ message: 'Bank account updated successfully', bankAccount: {
      bankName: bankAccount.bankName,
      accountHolderName: bankAccount.accountHolderName,
      accountNumber: bankAccount.accountNumber,
      ifscCode: bankAccount.ifscCode,
      branchName: bankAccount.branchName
  } });
  } catch (error) {
    res.status(500);
    throw new Error('Error saving bank account');
  }
});

// @desc    Get Bank Account by Account Number
// @route   GET /api/user/login/bank/:id
// @access  Private
const getBankAccountById = asyncHandler(async (req, res) => {
  const accountNumber = req.params.id;
  const userId = req.user.id;

  // Find the bank account by account number and userId
  const bankAccount = await BankAccount.findOne({ accountNumber, user: userId });
  if (!bankAccount) {
    res.status(404);
    throw new Error('Bank account not found');
  }

  res.status(200).json({ bankAccount });
});

// @desc    Delete Bank Account
// @route   DELETE /api/user/login/bank/:id
// @access  Private
const deleteBankAccount = asyncHandler(async (req, res) => {
  const accountNumber = req.params.id;
  const userId = req.user.id;

  const bankAccount = await BankAccount.findOneAndDelete({ accountNumber, user: userId });
  if (!bankAccount) {
    res.status(404);
    throw new Error('Bank account not found');
  }

  res.status(200).json({ message: 'Bank account deleted successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  addBankAccount,
  getBankAccounts,
  editBankAccount,
  deleteBankAccount,
  getBankAccountById
};
