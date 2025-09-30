const mongoose = require("mongoose")

const metricSchema = new mongoose.Schema(
  {
    team: {
      type: String,
      required: [true, "Team is required"],
      trim: true,
      maxlength: [50, "Team name cannot exceed 50 characters"],
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"],
    },
    year:{
      type: String,
      required: [true, "Year is required"],
      match: [/^\d{4}$/, "Year must be in YYYY format"],
    },
    testcaseAutomated: {
      type: Number,
      required: [true, "Testcase Automated count is required"],
      min: [0, "Testcase Automated cannot be negative"],
    },
    bugsFiled: {
      type: Number,
      required: [true, "Bugs Filed count is required"],
      min: [0, "Bugs Filed cannot be negative"],
    },
    scriptIssueFixed: {
      type: Number,
      required: [true, "Script Issue Fixed count is required"],
      min: [0, "Script Issue Fixed cannot be negative"],
    },
    scriptIntegrated: {
      type: Number,
      required: [true, "Script Integrated count is required"],
      min: [0, "Script Integrated cannot be negative"],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploaded by user is required"],
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate entries for same team and month
metricSchema.index({ team: 1, month: 1 }, { unique: true })

// Index for efficient queries
metricSchema.index({ team: 1, createdAt: -1 })
metricSchema.index({ month: 1 })

module.exports = mongoose.model("Metric", metricSchema)
