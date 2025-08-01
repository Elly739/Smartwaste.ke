const pool = require("../database/connection")
const { updateUserLevel, checkAchievements } = require("./userService")

const updateLeaderboards = async () => {
  try {
    console.log("🔄 Updating leaderboards...")

    // Update user levels for all users
    const usersResult = await pool.query("SELECT id FROM users WHERE is_active = true")

    for (const user of usersResult.rows) {
      await updateUserLevel(user.id)
      await checkAchievements(user.id)
    }

    console.log("✅ Leaderboards updated successfully")
  } catch (error) {
    console.error("❌ Error updating leaderboards:", error)
  }
}

const processPayments = async () => {
  try {
    console.log("🔄 Processing pending payments...")

    // Get pending payments
    const paymentsResult = await pool.query(`
      SELECT p.*, c.user_id, u.phone
      FROM payments p
      JOIN collectors c ON p.collector_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE p.status = 'Pending'
      ORDER BY p.created_at ASC
      LIMIT 50
    `)

    for (const payment of paymentsResult.rows) {
      try {
        // In a real implementation, you would integrate with M-Pesa API here
        // For now, we'll simulate successful payment processing

        const transactionId = `MP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

        await pool.query(
          `
          UPDATE payments 
          SET status = 'Completed', transaction_id = $1, processed_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `,
          [transactionId, payment.id],
        )

        console.log(`✅ Payment processed: ${payment.amount} KES to ${payment.phone_number}`)
      } catch (error) {
        console.error(`❌ Failed to process payment ${payment.id}:`, error)

        await pool.query(
          `
          UPDATE payments 
          SET status = 'Failed', processed_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
          [payment.id],
        )
      }
    }

    console.log("✅ Payment processing completed")
  } catch (error) {
    console.error("❌ Error processing payments:", error)
  }
}

module.exports = {
  updateLeaderboards,
  processPayments,
}
