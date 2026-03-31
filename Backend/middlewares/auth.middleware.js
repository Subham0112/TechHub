const jwt = require("jsonwebtoken");
const User = require("../models/users.model");
const bcrypt = require("bcrypt");


const authMiddleware = async (req, res, next) => {
 const token =
  req.cookies?.token ||
  (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null);
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: "Unauthorized User " });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
  
};



module.exports = authMiddleware;