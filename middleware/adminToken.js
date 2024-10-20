const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token after "Bearer"
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      // Check if the role is 'admin'
      if (decoded.admin.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden, not an admin' });
      }
      
      // Attach the decoded user information to the request object
      req.user = decoded;
      
      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid token' });
    }
});


module.exports = adminToken;
