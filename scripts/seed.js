const mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("../models/User")
const Metric = require("../models/Metric")

// Load environment variables
dotenv.config()

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Metric.deleteMany({})
    console.log("Cleared existing data")

    // Create whole managers
    const wholeManager1 = new User({
      name: "Whole Manager 1",
      email: "whole1@company.com",
      password: "password123",
      role: "whole_manager",
    })

    const wholeManager2 = new User({
      name: "Whole Manager 2",
      email: "whole2@company.com",
      password: "password123",
      role: "whole_manager",
    })

    await wholeManager1.save()
    await wholeManager2.save()

    // Create team managers assigned to whole managers
    const frontendManager = new User({
      name: "Frontend Team Manager",
      email: "frontend@company.com",
      password: "password123",
      role: "team_manager",
      team: "Frontend",
      assignedManager: wholeManager1._id,
    })

    const backendManager = new User({
      name: "Backend Team Manager",
      email: "backend@company.com",
      password: "password123",
      role: "team_manager",
      team: "Backend",
      assignedManager: wholeManager1._id,
    })

    const qaManager = new User({
      name: "QA Team Manager",
      email: "qa@company.com",
      password: "password123",
      role: "team_manager",
      team: "QA",
      assignedManager: wholeManager2._id,
    })

    await frontendManager.save()
    await backendManager.save()
    await qaManager.save()

    console.log("✅ Users created successfully!")

    // Create sample metrics data
    const metricsData = [
      // Frontend Team - 3 months (assigned to Whole Manager 1)
      {
        team: "Frontend",
        month: "2024-01",
        testcaseAutomated: 45,
        bugsFiled: 12,
        scriptIssueFixed: 8,
        scriptIntegrated: 15,
        uploadedBy: frontendManager._id,
      },
      {
        team: "Frontend",
        month: "2024-02",
        testcaseAutomated: 52,
        bugsFiled: 9,
        scriptIssueFixed: 11,
        scriptIntegrated: 18,
        uploadedBy: frontendManager._id,
      },
      {
        team: "Frontend",
        month: "2024-03",
        testcaseAutomated: 48,
        bugsFiled: 15,
        scriptIssueFixed: 7,
        scriptIntegrated: 20,
        uploadedBy: frontendManager._id,
      },
      // Backend Team - 3 months (assigned to Whole Manager 1)
      {
        team: "Backend",
        month: "2024-01",
        testcaseAutomated: 38,
        bugsFiled: 18,
        scriptIssueFixed: 12,
        scriptIntegrated: 10,
        uploadedBy: backendManager._id,
      },
      {
        team: "Backend",
        month: "2024-02",
        testcaseAutomated: 42,
        bugsFiled: 14,
        scriptIssueFixed: 15,
        scriptIntegrated: 13,
        uploadedBy: backendManager._id,
      },
      {
        team: "Backend",
        month: "2024-03",
        testcaseAutomated: 55,
        bugsFiled: 11,
        scriptIssueFixed: 9,
        scriptIntegrated: 16,
        uploadedBy: backendManager._id,
      },
      // QA Team - 3 months (assigned to Whole Manager 2)
      {
        team: "QA",
        month: "2024-01",
        testcaseAutomated: 32,
        bugsFiled: 22,
        scriptIssueFixed: 6,
        scriptIntegrated: 8,
        uploadedBy: qaManager._id,
      },
      {
        team: "QA",
        month: "2024-02",
        testcaseAutomated: 39,
        bugsFiled: 19,
        scriptIssueFixed: 10,
        scriptIntegrated: 12,
        uploadedBy: qaManager._id,
      },
      {
        team: "QA",
        month: "2024-03",
        testcaseAutomated: 44,
        bugsFiled: 16,
        scriptIssueFixed: 13,
        scriptIntegrated: 14,
        uploadedBy: qaManager._id,
      },
    ]

    await Metric.insertMany(metricsData)
    console.log("✅ Sample metrics data created successfully!")

    console.log("\n🎉 Database seeded successfully!")
    console.log("\n📋 Available users:")
    console.log("Whole Manager 1 - whole1@company.com / password123")
    console.log("Whole Manager 2 - whole2@company.com / password123")
    console.log("Frontend Manager - frontend@company.com / password123")
    console.log("Backend Manager - backend@company.com / password123")
    console.log("QA Manager - qa@company.com / password123")
    console.log("\n⚠️  Please change the default passwords after first login!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
