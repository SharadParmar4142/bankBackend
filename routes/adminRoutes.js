// routes/adminRoutes.js
const express = require('express');
const {registerAdmin,loginAdmin,getAllUsersBankInfo,searchUsers} = require('../controller/adminController');
const adminMiddleware = require('../middleware/adminToken');

const router = express.Router();

// Admin login
router.post('/register',registerAdmin)
router.post('/login', loginAdmin);

// Admin panel routes (secured with admin middleware)
router.get('/admin/bank-info', adminMiddleware,getAllUsersBankInfo);
router.get('/admin/search', adminMiddleware,searchUsers);

module.exports = router;
