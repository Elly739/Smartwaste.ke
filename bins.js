const express = require("express")
const Joi = require("joi")
const pool = require("../database/connection")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get QR bin information
router.get("/:binCode", authenticateToken, async (req, res) => {
  try {
    const { binCode } = req.params

    const result = await pool.query(
      `
      SELECT id, bin_code, location_name, location_address, bin_type, status, last_scan_at
      FROM qr_bins 
      WHERE bin_code = $1
    `,
      [binCode],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "QR bin not found" })
    }

    const bin = result.rows[0]

    if (bin.status !== "Active") {
      return res.status(400).json({ error: `Bin is currently ${bin.status.toLowerCase()}` })
    }

    res.json({
      bin: {
        id: bin.id,
        binCode: bin.bin_code,
        locationName: bin.location_name,
        locationAddress: bin.location_address,
        binType: bin.bin_type,
        status: bin.status,
        lastScanAt: bin.last_scan_at,
      },
    })
  } catch (error) {
    console.error("Get bin error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get nearby bins
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query

    let query = `
      SELECT id, bin_code, location_name, location_address, bin_type, status, 
             location_lat, location_lng, last_scan_at
      FROM qr_bins 
      WHERE status = 'Active'
    `
    const params = []

    // If coordinates provided, calculate distance
    if (lat && lng) {
      query += `
        AND (
          6371 * acos(
            cos(radians($${params.length + 1})) * 
            cos(radians(location_lat)) * 
            cos(radians(location_lng) - radians($${params.length + 2})) + 
            sin(radians($${params.length + 1})) * 
            sin(radians(location_lat))
          )
        ) <= $${params.length + 3}
      `
      params.push(Number.parseFloat(lat), Number.parseFloat(lng), Number.parseFloat(radius))
    }

    query += ` ORDER BY location_name ASC LIMIT 20`

    const result = await pool.query(query, params)

    const bins = result.rows.map((bin) => ({
      id: bin.id,
      binCode: bin.bin_code,
      locationName: bin.location_name,
      locationAddress: bin.location_address,
      binType: bin.bin_type,
      status: bin.status,
      locationLat: bin.location_lat,
      locationLng: bin.location_lng,
      lastScanAt: bin.last_scan_at,
    }))

    res.json({ bins })
  } catch (error) {
    console.error("Get bins error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router
