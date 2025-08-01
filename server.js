const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const dotenv = require("dotenv")
const cron = require("node-cron")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const pickupRoutes = require("./routes/pickups")
const rewardRoutes = require("./routes/rewards")
const adminRoutes = require("./routes/admin")
const binRoutes = require("./routes/bins")

// Import middleware
const { errorHandler } = require("./middleware/errorHandler")
const { rateLimiter } = require("./middleware/rateLimiter")

// Import scheduled tasks
const { updateLeaderboards, processPayments } = require("./services/scheduledTasks")

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
app.use(rateLimiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/pickups", pickupRoutes)
app.use("/api/rewards", rewardRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/bins", binRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Error handling middleware
app.use(errorHandler)

// Scheduled tasks
// Update leaderboards every hour
cron.schedule("0 * * * *", updateLeaderboards)

// Process payments daily at 2 AM
cron.schedule("0 2 * * *", processPayments)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SmartWaste KE Backend running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

module.exports = app
