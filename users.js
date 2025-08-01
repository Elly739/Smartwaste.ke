const express = require("express")
const pool = require("../database/connection")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get user achievements
router.get("/achievements", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT a.id, a.name, a.description, a.icon,
             ua.earned_at,
             CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as earned
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
      WHERE a.is_active = true
      ORDER BY a.points_required ASC, a.waste_required ASC, a.pickups_required ASC
    `,
      [req.user.userId],
    )

    const achievements = result.rows.map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      earned: achievement.earned,
      earnedAt: achievement.earned_at,
    }))

    res.json({ achievements })
  } catch (error) {
    console.error("Get achievements error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get monthly statistics
router.get("/monthly-stats", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        EXTRACT(MONTH FROM collected_at) as month_num,
        TO_CHAR(collected_at, 'Mon') as month,
        EXTRACT(YEAR FROM collected_at) as year,
        type,
        COALESCE(SUM(weight), 0) as total_weight,
        COALESCE(SUM(points_earned), 0) as total_points
      FROM pickup_requests 
      WHERE user_id = $1 AND status = 'Completed' AND collected_at IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM collected_at), EXTRACT(MONTH FROM collected_at), TO_CHAR(collected_at, 'Mon'), type
      ORDER BY year DESC, month_num DESC
    `,
      [req.user.userId],
    )

    // Group by month and year
    const monthlyStatsMap = new Map()

    result.rows.forEach((row) => {
      const key = `${row.month}-${row.year}`
      if (!monthlyStatsMap.has(key)) {
        monthlyStatsMap.set(key, {
          month: row.month,
          year: Number.parseInt(row.year),
          plastic: 0,
          organic: 0,
          ewaste: 0,
          totalPoints: 0,
        })
      }

      const stats = monthlyStatsMap.get(key)
      const wasteType = row.type.toLowerCase().replace("-", "")

      if (wasteType === "plastic") {
        stats.plastic += Number.parseFloat(row.total_weight)
      } else if (wasteType === "organic") {
        stats.organic += Number.parseFloat(row.total_weight)
      } else if (wasteType === "ewaste") {
        stats.ewaste += Number.parseFloat(row.total_weight)
      }

      stats.totalPoints += Number.parseInt(row.total_points)
    })

    const monthlyStats = Array.from(monthlyStatsMap.values())

    res.json({ monthlyStats })
  } catch (error) {
    console.error("Get monthly stats error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body

    // Validate input
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters long" })
    }

    if (phone && !/^\+254[0-9]{9}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format" })
    }

    const result = await pool.query(
      `
      UPDATE users 
      SET name = $1, phone = COALESCE($2, phone), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, phone, points, total_waste_recycled, level, has_completed_onboarding, created_at
    `,
      [name.trim(), phone, req.user.userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const user = result.rows[0]

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        points: user.points,
        totalWasteRecycled: Number.parseFloat(user.total_waste_recycled),
        level: user.level,
        hasCompletedOnboarding: user.has_completed_onboarding,
        joinedDate: user.created_at,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    if (error.code === "23505") {
      return res.status(409).json({ error: "Phone number already in use" })
    }
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get user leaderboard position
router.get("/leaderboard-position", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      WITH user_rankings AS (
        SELECT id, name, points, total_waste_recycled,
               ROW_NUMBER() OVER (ORDER BY points DESC, total_waste_recycled DESC) as rank
        FROM users 
        WHERE is_active = true AND has_completed_onboarding = true
      )
      SELECT rank, points, total_waste_recycled
      FROM user_rankings 
      WHERE id = $1
    `,
      [req.user.userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found in leaderboard" })
    }

    const userRank = result.rows[0]

    res.json({
      rank: Number.parseInt(userRank.rank),
      points: userRank.points,
      totalWasteRecycled: Number.parseFloat(userRank.total_waste_recycled),
    })
  } catch (error) {
    console.error("Get leaderboard position error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router
