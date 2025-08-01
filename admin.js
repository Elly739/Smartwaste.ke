const express = require("express")
const pool = require("../database/connection")
const { authenticateAdmin } = require("../middleware/auth")

const router = express.Router()

// Get dashboard statistics
router.get("/dashboard-stats", authenticateAdmin, async (req, res) => {
  try {
    // Get total waste collected
    const wasteResult = await pool.query(`
      SELECT COALESCE(SUM(weight), 0) as total_waste
      FROM pickup_requests 
      WHERE status = 'Completed'
    `)

    // Get active users count
    const usersResult = await pool.query(`
      SELECT COUNT(*) as active_users
      FROM users 
      WHERE is_active = true AND has_completed_onboarding = true
    `)

    // Get active pickups count
    const pickupsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_pickups,
        COUNT(CASE WHEN status IN ('Assigned', 'In Progress') THEN 1 END) as active_pickups
      FROM pickup_requests
    `)

    // Get revenue (mock calculation)
    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(points_cost * 0.1), 0) as revenue
      FROM reward_redemptions rr
      JOIN rewards r ON rr.reward_id = r.id
      WHERE rr.status = 'Completed'
    `)

    const stats = {
      totalWasteCollected: Number.parseFloat(wasteResult.rows[0].total_waste),
      activeUsers: Number.parseInt(usersResult.rows[0].active_users),
      totalPickups: Number.parseInt(pickupsResult.rows[0].total_pickups),
      activePickups: Number.parseInt(pickupsResult.rows[0].active_pickups),
      revenue: Number.parseFloat(revenueResult.rows[0].revenue),
    }

    res.json({ stats })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get waste collection trends
router.get("/waste-trends", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(collected_at, 'Mon') as month,
        type,
        COALESCE(SUM(weight), 0) as total_weight
      FROM pickup_requests 
      WHERE status = 'Completed' 
        AND collected_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(collected_at, 'Mon'), EXTRACT(MONTH FROM collected_at), type
      ORDER BY EXTRACT(MONTH FROM collected_at) ASC
    `)

    // Group by month
    const trendsMap = new Map()

    result.rows.forEach((row) => {
      if (!trendsMap.has(row.month)) {
        trendsMap.set(row.month, {
          month: row.month,
          plastic: 0,
          organic: 0,
          ewaste: 0,
        })
      }

      const trend = trendsMap.get(row.month)
      const wasteType = row.type.toLowerCase().replace("-", "")

      if (wasteType === "plastic") {
        trend.plastic = Number.parseFloat(row.total_weight)
      } else if (wasteType === "organic") {
        trend.organic = Number.parseFloat(row.total_weight)
      } else if (wasteType === "ewaste") {
        trend.ewaste = Number.parseFloat(row.total_weight)
      }
    })

    const trends = Array.from(trendsMap.values())

    res.json({ trends })
  } catch (error) {
    console.error("Get waste trends error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get top users leaderboard
router.get("/leaderboard", authenticateAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const result = await pool.query(
      `
      SELECT u.id, u.name, u.points, u.total_waste_recycled,
             COUNT(pr.id) as total_pickups,
             ROW_NUMBER() OVER (ORDER BY u.points DESC, u.total_waste_recycled DESC) as rank
      FROM users u
      LEFT JOIN pickup_requests pr ON u.id = pr.user_id AND pr.status = 'Completed'
      WHERE u.is_active = true AND u.has_completed_onboarding = true
      GROUP BY u.id, u.name, u.points, u.total_waste_recycled
      ORDER BY u.points DESC, u.total_waste_recycled DESC
      LIMIT $1
    `,
      [Number.parseInt(limit)],
    )

    const leaderboard = result.rows.map((user) => ({
      id: user.id,
      name: user.name,
      points: user.points,
      totalWasteRecycled: Number.parseFloat(user.total_waste_recycled),
      totalPickups: Number.parseInt(user.total_pickups),
      rank: Number.parseInt(user.rank),
    }))

    res.json({ leaderboard })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get recent pickup activity
router.get("/recent-activity", authenticateAdmin, async (req, res) => {
  try {
    const { limit = 20 } = req.query

    const result = await pool.query(
      `
      SELECT pr.id, pr.type, pr.status, pr.weight, pr.points_earned, pr.created_at, pr.collected_at,
             u.name as user_name, c.name as collector_name
      FROM pickup_requests pr
      JOIN users u ON pr.user_id = u.id
      LEFT JOIN users c ON pr.collector_id = c.id
      ORDER BY pr.created_at DESC
      LIMIT $1
    `,
      [Number.parseInt(limit)],
    )

    const activity = result.rows.map((pickup) => ({
      id: pickup.id,
      type: pickup.type,
      status: pickup.status,
      weight: pickup.weight ? Number.parseFloat(pickup.weight) : null,
      pointsEarned: pickup.points_earned,
      userName: pickup.user_name,
      collectorName: pickup.collector_name,
      createdAt: pickup.created_at,
      collectedAt: pickup.collected_at,
    }))

    res.json({ activity })
  } catch (error) {
    console.error("Get recent activity error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router
