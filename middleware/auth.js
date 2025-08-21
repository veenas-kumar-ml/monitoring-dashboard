const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Verify JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(401).json({ message: "Invalid token. User not found." })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." })
    }
    res.status(500).json({ message: "Server error during authentication." })
  }
}

// Check if user has required role(s)
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
        required: allowedRoles,
        current: req.user.role,
      })
    }

    next()
  }
}

module.exports = {
  authMiddleware,
  roleMiddleware,
}