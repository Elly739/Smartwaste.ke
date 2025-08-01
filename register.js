const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Joi = require("joi")
const { neon } = require("@neondatabase/serverless")

const sql = neon(process.env.DATABASE_URL)

// Validation schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\+254[0-9]{9}$/)
    .required(),
  password: Joi.string().min(6).required(),
})

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
    // Validate input
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, email, phone, password } = value

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} OR phone = ${phone}
    `

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "User with this email or phone already exists" })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const result = await sql`
      INSERT INTO users (name, email, phone, password_hash)
      VALUES (${name}, ${email}, ${phone}, ${passwordHash})
      RETURNING id, name, email, phone, points, total_waste_recycled, level, has_completed_onboarding, created_at
    `

    const user = result[0]

    // Award welcome achievement
    const welcomeAchievement = await sql`
      SELECT id FROM achievements WHERE name = 'Welcome Aboard'
    `

    if (welcomeAchievement.length > 0) {
      await sql`
        INSERT INTO user_achievements (user_id, achievement_id) 
        VALUES (${user.id}, ${welcomeAchievement[0].id})
      `
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    res.status(201).json({
      message: "User registered successfully",
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
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
