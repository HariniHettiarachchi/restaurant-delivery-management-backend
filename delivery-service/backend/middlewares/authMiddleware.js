const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Make sure we're using the correct secret key
    const secretKey = process.env.JWT_SECRET;
    
    if (!secretKey) {
      console.error("JWT_SECRET is missing in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Use proper verification options to match token generation
    const decoded = jwt.verify(token, secretKey, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    });
    
    // Properly extract user details from the token
    req.user = {
      id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    };
    
    next();
  } catch (error) {
    console.error("Token verification error:", error); 
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
