const jwt = require("jsonwebtoken")
const { neon } = require("@neondatabase/serverless")

const sql = neon(process.env.DATABASE_URL)

function authenticateToken(req) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    throw new Error("Access token required")
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    return user
  } catch (err) {
    throw new Error("Invalid or expired token")
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true)
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  )

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    authenticateToken(req)

    const result = await sql`
      SELECT id, name, description, category, points_cost, value_kes, stock_quantity
      FROM rewards 
      WHERE is_available = true
      ORDER BY points_cost ASC
    `

    const rewards = result.map((reward) => ({
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
    if (error.message === "Access token required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message })
    }
    res.status(500).json({ error: "Internal server error" })
  }
}
