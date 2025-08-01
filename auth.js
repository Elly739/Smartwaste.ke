const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Joi = require("joi")
const pool = require("../database/connection")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\+254[0-9]{9}$/)
    .required(),
  password: Joi.string().min(6).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

// Register new user
router.post("/register", async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, email, phone, password } = value

    // Check if user already exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1 OR phone = $2", [email, phone])

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "User with this email or phone already exists" })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const result = await pool.query(
      `
      INSERT INTO users (name, email, phone, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, phone, points, total_waste_recycled, level, has_completed_onboarding, created_at
    `,
      [name, email, phone, passwordHash],
    )

    const user = result.rows[0]

    // Award welcome achievement
    const welcomeAchievement = await pool.query("SELECT id FROM achievements WHERE name = $1", ["Welcome Aboard"])

    if (welcomeAchievement.rows.length > 0) {
      await pool.query("INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)", [
        user.id,
        welcomeAchievement.rows[0].id,
      ])
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
})

// Login user
router.post("/login", async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { email, password } = value

    // Find user
    const result = await pool.query(
      `
      SELECT id, name, email, phone, password_hash, points, total_waste_recycled, 
             level, has_completed_onboarding, created_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `,
      [email],
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    res.json({
      message: "Login successful",
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
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, phone, points, total_waste_recycled, 
             level, has_completed_onboarding, created_at
      FROM users 
      WHERE id = $1 AND is_active = true
    `,
      [req.user.userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const user = result.rows[0]

    res.json({
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
    console.error("Profile error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Complete onboarding
router.post("/complete-onboarding", authenticateToken, async (req, res) => {
  try {
    await pool.query("UPDATE users SET has_completed_onboarding = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [
      req.user.userId,
    ])

    res.json({ message: "Onboarding completed successfully" })
  } catch (error) {
    console.error("Complete onboarding error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router
