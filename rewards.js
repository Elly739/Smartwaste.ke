const express = require("express")
const Joi = require("joi")
const pool = require("../database/connection")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get available rewards
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, category, points_cost, value_kes, stock_quantity
      FROM rewards 
      WHERE is_available = true
      ORDER BY points_cost ASC
    `)

    const rewards = result.rows.map((reward) => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      category: reward.category,
      pointsCost: reward.points_cost,
      valueKes: Number.parseFloat(reward.value_kes),
      available: reward.stock_quantity !== 0,
    }))

    res.json({ rewards })
  } catch (error) {
    console.error("Get rewards error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Redeem reward
router.post("/:id/redeem", authenticateToken, async (req, res) => {
  try {
    const rewardId = req.params.id

    // Get reward details
    const rewardResult = await pool.query("SELECT * FROM rewards WHERE id = $1 AND is_available = true", [rewardId])

    if (rewardResult.rows.length === 0) {
      return res.status(404).json({ error: "Reward not found or unavailable" })
    }

    const reward = rewardResult.rows[0]

    // Check stock
    if (reward.stock_quantity === 0) {
      return res.status(400).json({ error: "Reward out of stock" })
    }

    // Get user points
    const userResult = await pool.query("SELECT points FROM users WHERE id = $1", [req.user.userId])
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const userPoints = userResult.rows[0].points

    if (userPoints < reward.points_cost) {
      return res.status(400).json({ error: "Insufficient points" })
    }

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Deduct points from user
      await client.query("UPDATE users SET points = points - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
        reward.points_cost,
        req.user.userId,
      ])

      // Update stock if not unlimited
      if (reward.stock_quantity > 0) {
        await client.query("UPDATE rewards SET stock_quantity = stock_quantity - 1 WHERE id = $1", [rewardId])
      }

      // Create redemption record
      const redemptionCode = `RDM${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      await client.query(
        `
        INSERT INTO reward_redemptions (user_id, reward_id, points_spent, redemption_code)
        VALUES ($1, $2, $3, $4)
      `,
        [req.user.userId, rewardId, reward.points_cost, redemptionCode],
      )

      await client.query("COMMIT")

      res.json({
        message: "Reward redeemed successfully",
        redemptionCode,
        pointsSpent: reward.points_cost,
      })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Redeem reward error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get user's redemption history
router.get("/redemptions", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT rr.*, r.name as reward_name, r.description as reward_description
      FROM reward_redemptions rr
      JOIN rewards r ON rr.reward_id = r.id
      WHERE rr.user_id = $1
      ORDER BY rr.redeemed_at DESC
    `,
      [req.user.userId],
    )

    const redemptions = result.rows.map((redemption) => ({
      id: redemption.id,
      rewardName: redemption.reward_name,
      rewardDescription: redemption.reward_description,
      pointsSpent: redemption.points_spent,
      status: redemption.status,
      redemptionCode: redemption.redemption_code,
      redeemedAt: redemption.redeemed_at,
      processedAt: redemption.processed_at,
    }))

    res.json({ redemptions })
  } catch (error) {
    console.error("Get redemptions error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router
