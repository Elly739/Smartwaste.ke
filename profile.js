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
    const user = authenticateToken(req)

    const result = await sql`
      SELECT id, name, email, phone, points, total_waste_recycled, 
             level, has_completed_onboarding, created_at
      FROM users 
      WHERE id = ${user.userId} AND is_active = true
    `

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const userData = result[0]

    res.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        points: userData.points,
        totalWasteRecycled: Number.parseFloat(userData.total_waste_recycled),
        level: userData.level,
        hasCompletedOnboarding: userData.has_completed_onboarding,
        joinedDate: userData.created_at,
      },
    })
  } catch (error) {
    console.error("Profile error:", error)
    if (error.message === "Access token required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message })
    }
    res.status(500).json({ error: "Internal server error" })
  }
}
