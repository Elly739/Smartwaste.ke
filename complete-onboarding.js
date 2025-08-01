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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const user = authenticateToken(req)

    await sql`
      UPDATE users 
      SET has_completed_onboarding = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${user.userId}
    `

    res.json({ message: "Onboarding completed successfully" })
  } catch (error) {
    console.error("Complete onboarding error:", error)
    if (error.message === "Access token required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message })
    }
    res.status(500).json({ error: "Internal server error" })
  }
}
