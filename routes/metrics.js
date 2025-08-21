const express = require("express")
const { body, query, validationResult } = require("express-validator")
const Metric = require("../models/Metric")
const User = require("../models/User")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")

const router = express.Router()

// Upload metrics (team_manager only)
router.post(
  "/",
  [
    authMiddleware,
    roleMiddleware("team_manager"),
    body("month")
      .matches(/^\d{4}-\d{2}$/)
      .withMessage("Month must be in YYYY-MM format"),
    body("testcaseAutomated").isInt({ min: 0 }).withMessage("Testcase Automated must be a non-negative integer"),
    body("bugsFiled").isInt({ min: 0 }).withMessage("Bugs Filed must be a non-negative integer"),
    body("scriptIssueFixed").isInt({ min: 0 }).withMessage("Script Issue Fixed must be a non-negative integer"),
    body("scriptIntegrated").isInt({ min: 0 }).withMessage("Script Integrated must be a non-negative integer"),
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

      const { month, testcaseAutomated, bugsFiled, scriptIssueFixed, scriptIntegrated } = req.body

      // Check if metrics for this team and month already exist
      const existingMetric = await Metric.findOne({
        team: req.user.team,
        month,
      })

      if (existingMetric) {
        return res.status(400).json({
          message: `Metrics for ${req.user.team} team in ${month} already exist. Use PUT to update.`,
        })
      }

      // Create new metric
      const metric = new Metric({
        team: req.user.team,
        month,
        testcaseAutomated,
        bugsFiled,
        scriptIssueFixed,
        scriptIntegrated,
        uploadedBy: req.user._id,
      })

      await metric.save()
      await metric.populate("uploadedBy", "name email")

      res.status(201).json({
        message: "Metrics uploaded successfully",
        metric,
      })
    } catch (error) {
      console.error("Metrics upload error:", error)
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Metrics for this team and month already exist",
        })
      }
      res.status(500).json({ message: "Server error during metrics upload" })
    }
  },
)

// Get metrics
router.get(
  "/",
  [
    authMiddleware,
    query("team").optional().trim().isLength({ min: 1, max: 50 }).withMessage("Team name must be 1-50 characters"),
    query("month")
      .optional()
      .matches(/^\d{4}-\d{2}$/)
      .withMessage("Month must be in YYYY-MM format"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
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

      const { team, month, limit = 50, page = 1 } = req.query
      const skip = (page - 1) * limit

      // Build query based on user role
      const query = {}

      if (req.user.role === "team_manager") {
        // Team managers can only see their own team's metrics
        query.team = req.user.team
      } else if (req.user.role === "whole_manager") {
        // Whole managers can only see metrics from teams they manage
        // Get all team managers assigned to this whole manager
        const assignedTeamManagers = await User.find({ 
          assignedManager: req.user._id,
          role: "team_manager"
        }).select("team")
        
        const managedTeams = assignedTeamManagers.map(tm => tm.team)

        console.log("Managed Teams:", managedTeams) // Debug log

        if (managedTeams.length > 0) {
          query.team = { $in: managedTeams }
          
          // Apply team filter if provided
          if (team && managedTeams.includes(team)) {
            query.team = team
          }
        } else {
          // If no teams are assigned, return empty result
          query.team = { $in: [] }
        }
      }

      // Add month filter if provided
      if (month) {
        query.month = month
      }

      // Execute query with pagination
      const [metrics, totalCount] = await Promise.all([
        Metric.find(query)
          .populate("uploadedBy", "name email")
          .sort({ createdAt: -1 })
          .limit(Number.parseInt(limit))
          .skip(skip),
        Metric.countDocuments(query),
      ])

      // Get unique teams for whole managers
      let teams = []
      if (req.user.role === "whole_manager") {
        teams = await Metric.distinct("team")
      }

      res.json({
        metrics,
        teams: req.user.role === "whole_manager" ? teams : [req.user.team],
      })
    } catch (error) {
      console.error("Metrics fetch error:", error)
      res.status(500).json({ message: "Server error during metrics fetch" })
    }
  },
)

// Get metrics summary/statistics
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const matchStage = {}

    if (req.user.role === "team_manager") {
      matchStage.team = req.user.team
    }

    const summary = await Metric.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: req.user.role === "whole_manager" ? "$team" : null,
          totalTestcaseAutomated: { $sum: "$testcaseAutomated" },
          totalBugsFiled: { $sum: "$bugsFiled" },
          totalScriptIssueFixed: { $sum: "$scriptIssueFixed" },
          totalScriptIntegrated: { $sum: "$scriptIntegrated" },
          monthCount: { $sum: 1 },
          avgTestcaseAutomated: { $avg: "$testcaseAutomated" },
          avgBugsFiled: { $avg: "$bugsFiled" },
          team: { $first: "$team" },
        },
      },
      { $sort: { team: 1 } },
    ])

    res.json({
      summary,
      userRole: req.user.role,
      userTeam: req.user.team,
    })
  } catch (error) {
    console.error("Summary fetch error:", error)
    res.status(500).json({ message: "Server error during summary fetch" })
  }
})

module.exports = router
