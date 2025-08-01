const express = require("express")
const Joi = require("joi")
const pool = require("../database/connection")
const { authenticateToken } = require("../middleware/auth")
const { updateUserLevel, checkAchievements } = require("../services/userService")

const router = express.Router()

// Validation schemas
const createPickupSchema = Joi.object({
  type: Joi.string().valid("Plastic", "Organic", "E-waste").required(),
  locationLat: Joi.number().min(-90).max(90),
  locationLng: Joi.number().min(-180).max(180),
  locationAddress: Joi.string().max(500),
  notes: Joi.string().max(1000),
  scheduledAt: Joi.date().iso(),
})

const completePickupSchema = Joi.object({
  weight: Joi.number().min(0.1).max(1000).required(),
  binCode: Joi.string().required(),
})

// Create pickup request
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { error, value } = createPickupSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { type, locationLat, locationLng, locationAddress, notes, scheduledAt } = value

    const result = await pool.query(
      `
      INSERT INTO pickup_requests (user_id, type, location_lat, location_lng, location_address, notes, scheduled_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [req.user.userId, type, locationLat, locationLng, locationAddress, notes, scheduledAt],
    )

    const pickup = result.rows[0]

    res.status(201).json({
      message: "Pickup request created successfully",
      pickup: {
        id: pickup.id,
        type: pickup.type,
        status: pickup.status,
        locationLat: pickup.location_lat,
        locationLng: pickup.location_lng,
        locationAddress: pickup.location_address,
        notes: pickup.notes,
        scheduledAt: pickup.scheduled_at,
        createdAt: pickup.created_at,
      },
    })
  } catch (error) {
    console.error("Create pickup error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get user's pickup requests
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query

    let query = `
      SELECT pr.*, c.name as collector_name
      FROM pickup_requests pr
      LEFT JOIN users c ON pr.collector_id = c.id
      WHERE pr.user_id = $1
    `
    const params = [req.user.userId]

    if (status) {
      query += ` AND pr.status = $${params.length + 1}`
      params.push(status)
    }

    query += ` ORDER BY pr.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const result = await pool.query(query, params)

    const pickups = result.rows.map((pickup) => ({
      id: pickup.id,
      type: pickup.type,
      status: pickup.status,
      weight: pickup.weight ? Number.parseFloat(pickup.weight) : null,
      pointsEarned: pickup.points_earned,
      locationLat: pickup.location_lat,
      locationLng: pickup.location_lng,
      locationAddress: pickup.location_address,
      notes: pickup.notes,
      collectorName: pickup.collector_name,
      scheduledAt: pickup.scheduled_at,
      collectedAt: pickup.collected_at,
      createdAt: pickup.created_at,
    }))

    res.json({ pickups })
  } catch (error) {
    console.error("Get pickups error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Complete pickup (scan QR and weigh)
router.post("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const { error, value } = completePickupSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { weight, binCode } = value
    const pickupId = req.params.id

    // Verify bin exists
    const binResult = await pool.query("SELECT * FROM qr_bins WHERE bin_code = $1", [binCode])
    if (binResult.rows.length === 0) {
      return res.status(404).json({ error: "Invalid QR bin code" })
    }

    // Get pickup request
    const pickupResult = await pool.query("SELECT * FROM pickup_requests WHERE id = $1 AND user_id = $2", [
      pickupId,
      req.user.userId,
    ])

    if (pickupResult.rows.length === 0) {
      return res.status(404).json({ error: "Pickup request not found" })
    }

    const pickup = pickupResult.rows[0]

    if (pickup.status === "Completed") {
      return res.status(400).json({ error: "Pickup already completed" })
    }

    // Calculate points based on waste type and weight
    const pointsPerKg = {
      Plastic: 5,
      Organic: 3,
      "E-waste": 15,
    }

    const pointsEarned = Math.floor(weight * pointsPerKg[pickup.type])

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Update pickup request
      await client.query(
        `
        UPDATE pickup_requests 
        SET status = 'Completed', weight = $1, points_earned = $2, collected_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `,
        [weight, pointsEarned, pickupId],
      )

      // Update user points and waste total
      await client.query(
        `
        UPDATE users 
        SET points = points + $1, total_waste_recycled = total_waste_recycled + $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `,
        [pointsEarned, weight, req.user.userId],
      )

      // Update bin last scan time
      await client.query("UPDATE qr_bins SET last_scan_at = CURRENT_TIMESTAMP WHERE bin_code = $1", [binCode])

      await client.query("COMMIT")

      // Update user level and check achievements (outside transaction)
      await updateUserLevel(req.user.userId)
      await checkAchievements(req.user.userId)

      res.json({
        message: "Pickup completed successfully",
        pointsEarned,
        weight: Number.parseFloat(weight),
      })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Complete pickup error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get pickup statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        COUNT(*) as total_pickups,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_pickups,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_pickups,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN weight END), 0) as total_weight,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN points_earned END), 0) as total_points_from_pickups
      FROM pickup_requests 
      WHERE user_id = $1
    `,
      [req.user.userId],
    )

    const stats = result.rows[0]

    res.json({
      totalPickups: Number.parseInt(stats.total_pickups),
      completedPickups: Number.parseInt(stats.completed_pickups),
      pendingPickups: Number.parseInt(stats.pending_pickups),
      totalWeight: Number.parseFloat(stats.total_weight),
      totalPointsFromPickups: Number.parseInt(stats.total_points_from_pickups),
    })
  } catch (error) {
    console.error("Get pickup stats error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router
