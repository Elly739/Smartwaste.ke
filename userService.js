const pool = require("../database/connection")

const updateUserLevel = async (userId) => {
  try {
    const userResult = await pool.query("SELECT points FROM users WHERE id = $1", [userId])
    if (userResult.rows.length === 0) return

    const points = userResult.rows[0].points
    let newLevel = "Eco Beginner"

    if (points >= 2000) newLevel = "Eco Master"
    else if (points >= 1000) newLevel = "Eco Champion"
    else if (points >= 500) newLevel = "Eco Warrior"
    else if (points >= 100) newLevel = "Eco Explorer"

    await pool.query("UPDATE users SET level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newLevel, userId])
  } catch (error) {
    console.error("Update user level error:", error)
  }
}

const checkAchievements = async (userId) => {
  try {
    // Get user stats
    const userResult = await pool.query(
      `
      SELECT u.points, u.total_waste_recycled,
             COUNT(pr.id) as total_pickups,
             COUNT(CASE WHEN pr.status = 'Completed' THEN 1 END) as completed_pickups
      FROM users u
      LEFT JOIN pickup_requests pr ON u.id = pr.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.points, u.total_waste_recycled
    `,
      [userId],
    )

    if (userResult.rows.length === 0) return

    const user = userResult.rows[0]

    // Get all achievements
    const achievementsResult = await pool.query("SELECT * FROM achievements WHERE is_active = true")
    const achievements = achievementsResult.rows

    // Get user's current achievements
    const userAchievementsResult = await pool.query("SELECT achievement_id FROM user_achievements WHERE user_id = $1", [
      userId,
    ])
    const userAchievementIds = userAchievementsResult.rows.map((row) => row.achievement_id)

    // Check each achievement
    for (const achievement of achievements) {
      if (userAchievementIds.includes(achievement.id)) continue // Already earned

      let earned = false

      // Check conditions
      if (achievement.points_required > 0 && user.points >= achievement.points_required) {
        earned = true
      }

      if (
        achievement.waste_required > 0 &&
        Number.parseFloat(user.total_waste_recycled) >= achievement.waste_required
      ) {
        earned = true
      }

      if (achievement.pickups_required > 0 && Number.parseInt(user.completed_pickups) >= achievement.pickups_required) {
        earned = true
      }

      // Special case for welcome achievement
      if (achievement.name === "Welcome Aboard") {
        earned = true
      }

      if (earned) {
        await pool.query(
          "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, achievement.id],
        )
      }
    }
  } catch (error) {
    console.error("Check achievements error:", error)
  }
}

module.exports = {
  updateUserLevel,
  checkAchievements,
}
