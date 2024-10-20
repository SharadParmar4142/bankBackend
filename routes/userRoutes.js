const express = require('express');
const {registerUser,loginUser,addBankAccount,getBankAccounts,editBankAccount,deleteBankAccount,getBankAccountById} = require('../controller/userController');
const authMiddleware = require('../middleware/userToken');

const router = express.Router();

// User registration and login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Bank account management (secured with middleware)
router.post('/login/bank/add', authMiddleware, addBankAccount);
router.get('/login/bank/view', authMiddleware, getBankAccounts);

router.put('/login/bank/edit/:id', authMiddleware, editBankAccount);

// New route to get bank account details by account number
router.get('/login/bank/:id', authMiddleware, getBankAccountById);

router.delete('/login/bank/remove/:id', authMiddleware, deleteBankAccount);

module.exports = router;



