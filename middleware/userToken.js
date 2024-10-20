const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const userToken = asyncHandler(async (req, res, next) => {
  let token;

  // Token passed through Header
  let authHeader = req.headers.authorization || req.headers.Authorization;

  // Check if Authorization header is present
  if (authHeader && authHeader.startsWith("Bearer")) {
    // Extracting the token
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "User not authorized or token is missing in the request" });
  }

  // Verifying the token
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "User is not authorized" });
      }
      // Attach user info to the request object
      req.user = decoded.user;
      next(); // Proceed to the next middleware/route handler
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = userToken;
