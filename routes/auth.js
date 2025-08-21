const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")

const router = express.Router()

// Generate JWT token
const generateToken = (userId, role, team, email) => {
  return jwt.sign({ userId, role, team, email }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// Public registration for signup page (creates whole managers or team managers without assigned manager)
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Name must be 1-100 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["team_manager"]).withMessage("Only team_manager role can be registered"),
    body("team").trim().isLength({ min: 1, max: 50 }).withMessage("Team name is required and must be 1-50 characters"),
    body("assignedManager").optional().isMongoId().withMessage("Invalid assigned manager ID"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array())
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, email, password, role, team, assignedManager } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" })
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        role,
        team,
        assignedManager, // Store the assigned manager
      })

      await user.save()

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          team: user.team,
          assignedManager: user.assignedManager,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// Admin registration (whole_manager can create team_manager users)
router.post(
  "/admin/register",
  [
    authMiddleware,
    body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Name must be 1-100 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["whole_manager", "team_manager"]).withMessage("Invalid role"),
    body("team").optional().trim().isLength({ min: 1, max: 50 }).withMessage("Team name must be 1-50 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }
      console.log(req.body)

      const { name, email, password, role, team } = req.body

      // Only whole managers can create users
      if (req.user.role !== "whole_manager") {
        return res.status(403).json({ message: "Only whole managers can create users" })
      }

      // Whole managers can only create team managers
      if (role !== "team_manager") {
        return res.status(403).json({ message: "Whole managers can only create team managers" })
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" })
      }

      // Validate team is provided for team_manager
      if (!team) {
        return res.status(400).json({ message: "Team is required for team manager" })
      }

      // For whole managers, team should not be provided
      if (role === "whole_manager" && team) {
        return res.status(400).json({ message: "Team should not be provided for whole manager" })
      }

      const userData = {
        name,
        email,
        password,
        role,
        team,
        assignedManager: req.user._id, // Assign to the current whole manager
      }

      const user = new User(userData)
      await user.save()

      res.status(201).json({
        message: "Team manager created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          team: user.team,
          assignedManager: user.assignedManager,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      console.log(req.body)
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        console.log("Not user")
        return res.status(401).json({ message: "Invalid email or password" })
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        console.log("Wrong password")
        return res.status(401).json({ message: "Invalid email or password" })
      }

      // Generate token
      const token = generateToken(user._id, user.role, user.team, user.email)

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          team: user.team,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  },
)

// Get current user info
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      team: req.user.team,
    },
  })
})

// Get team managers assigned to current whole manager and unassigned team managers
router.get("/users", authMiddleware, async (req, res) => {
  try {
    // Only whole managers can view team managers
    if (req.user.role !== "whole_manager") {
      return res.status(403).json({ message: "Access denied. Only whole managers can view team managers." })
    }

    // Show team managers assigned to this whole manager and unassigned team managers
    const users = await User.find({ 
      role: "team_manager",
      $or: [
        { assignedManager: req.user._id },
        { assignedManager: { $exists: false } },
        { assignedManager: null }
      ]
    }).select("-password").sort({ createdAt: -1 })
    
    res.json({
      users,
      count: users.length
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Server error while fetching users" })
  }
})

// Assign team manager to whole manager
router.put("/users/:userId/assign", authMiddleware, async (req, res) => {
  try {
    // Only whole managers can assign team managers
    if (req.user.role !== "whole_manager") {
      return res.status(403).json({ message: "Access denied. Only whole managers can assign team managers." })
    }

    const { userId } = req.params

    // Find the team manager (must not be assigned to anyone else)
    const user = await User.findOne({ 
      _id: userId,
      role: "team_manager",
      $or: [
        { assignedManager: { $exists: false } },
        { assignedManager: null }
      ]
    })
    
    if (!user) {
      return res.status(404).json({ message: "Team manager not found or already assigned to another whole manager." })
    }

    // Assign to current whole manager
    user.assignedManager = req.user._id
    await user.save()

    res.json({ 
      message: "Team manager assigned successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        assignedManager: user.assignedManager,
      }
    })
  } catch (error) {
    console.error("Error assigning user:", error)
    res.status(500).json({ message: "Server error while assigning user" })
  }
})

// Delete team manager (whole_manager can only delete their assigned team managers)
router.delete("/users/:userId", authMiddleware, async (req, res) => {
  try {
    // Only whole managers can delete their team managers
    if (req.user.role !== "whole_manager") {
      return res.status(403).json({ message: "Access denied. Only whole managers can delete their team managers." })
    }

    const { userId } = req.params

    // Find the user and check if they're assigned to this whole manager
    const user = await User.findOne({ 
      _id: userId,
      assignedManager: req.user._id,
      role: "team_manager"
    })
    
    if (!user) {
      return res.status(404).json({ message: "Team manager not found or not assigned to you." })
    }

    await User.findByIdAndDelete(userId)

    res.json({ message: "Team manager deleted successfully." })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Server error while deleting user" })
  }
})

// Endpoint to fetch whole managers
router.get("/whole-managers",  async (req, res) => {
  try {
    console.log("Fetching whole managers...")
    // Fetch users with the role of 'whole_manager'
    const wholeManagers = await User.find({ role: "whole_manager" }).select("_id name");

    res.json(wholeManagers);
  } catch (error) {
    console.error("Error fetching whole managers:", error);
    res.status(500).json({ message: "Failed to fetch whole managers" });
  }
});

module.exports = router
