const pool = require("../src/database/connection")
const bcrypt = require("bcryptjs")

const setupDemoData = async () => {
  try {
    console.log("🔄 Setting up demo data...")

    // Create demo users with different levels of activity
    const demoUsers = [
      {
        name: "John Kamau",
        email: "john@example.com",
        phone: "+254712345678",
        points: 1247,
        totalWaste: 23.5,
        level: "Eco Champion",
      },
      {
        name: "Mary Wanjiku",
        email: "mary@example.com",
        phone: "+254723456789",
        points: 2100,
        totalWaste: 38.7,
        level: "Eco Master",
      },
      {
        name: "Peter Ochieng",
        email: "peter@example.com",
        phone: "+254734567890",
        points: 890,
        totalWaste: 34.1,
        level: "Eco Warrior",
      },
    ]

    for (const userData of demoUsers) {
      const passwordHash = await bcrypt.hash("demo123", 10)

      const userResult = await pool.query(
        `
        INSERT INTO users (name, email, phone, password_hash, points, total_waste_recycled, level, has_completed_onboarding)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET
          points = EXCLUDED.points,
          total_waste_recycled = EXCLUDED.total_waste_recycled,
          level = EXCLUDED.level
        RETURNING id
      `,
        [
          userData.name,
          userData.email,
          userData.phone,
          passwordHash,
          userData.points,
          userData.totalWaste,
          userData.level,
          true,
        ],
      )

      const userId = userResult.rows[0].id

      // Create some pickup requests for each user
      const pickupTypes = ["Plastic", "Organic", "E-waste"]
      const statuses = ["Completed", "Completed", "Completed", "Pending"]

      for (let i = 0; i < 5; i++) {
        const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const weight = status === "Completed" ? Math.random() * 10 + 1 : null
        const pointsEarned = weight ? Math.floor(weight * (type === "E-waste" ? 15 : type === "Plastic" ? 5 : 3)) : 0

        await pool.query(
          `
          INSERT INTO pickup_requests (user_id, type, status, weight, points_earned, location_address, created_at, collected_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            userId,
            type,
            status,
            weight,
            pointsEarned,
            "Demo Location, Nairobi",
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
            status === "Completed" ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
          ],
        )
      }

      // Award some achievements
      const welcomeAchievement = await pool.query("SELECT id FROM achievements WHERE name = 'Welcome Aboard'")
      if (welcomeAchievement.rows.length > 0) {
        await pool.query(
          "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, welcomeAchievement.rows[0].id],
        )
      }

      if (userData.points >= 500) {
        const ecoWarriorAchievement = await pool.query("SELECT id FROM achievements WHERE name = 'Eco Warrior'")
        if (ecoWarriorAchievement.rows.length > 0) {
          await pool.query(
            "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [userId, ecoWarriorAchievement.rows[0].id],
          )
        }
      }
    }

    console.log("✅ Demo data setup completed")
  } catch (error) {
    console.error("❌ Demo data setup error:", error)
  }
}

// Run if executed directly
if (require.main === module) {
  setupDemoData().then(() => process.exit(0))
}

module.exports = { setupDemoData }
