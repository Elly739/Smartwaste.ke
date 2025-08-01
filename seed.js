const pool = require("./connection")
const bcrypt = require("bcryptjs")

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding database...")

    // Seed achievements
    const achievements = [
      {
        name: "Welcome Aboard",
        description: "Joined SmartWaste KE",
        icon: "star",
        points_required: 0,
        waste_required: 0,
        pickups_required: 0,
      },
      {
        name: "First Pickup",
        description: "Completed your first pickup request",
        icon: "recycle",
        points_required: 0,
        waste_required: 0,
        pickups_required: 1,
      },
      {
        name: "Eco Warrior",
        description: "Earned 500 points",
        icon: "leaf",
        points_required: 500,
        waste_required: 0,
        pickups_required: 0,
      },
      {
        name: "100kg Recycled",
        description: "Recycled 100kg of waste",
        icon: "trophy",
        points_required: 0,
        waste_required: 100,
        pickups_required: 0,
      },
      {
        name: "Point Master",
        description: "Earned 1000 points",
        icon: "award",
        points_required: 1000,
        waste_required: 0,
        pickups_required: 0,
      },
      {
        name: "Community Hero",
        description: "Earned 2000 points",
        icon: "award",
        points_required: 2000,
        waste_required: 0,
        pickups_required: 0,
      },
    ]

    for (const achievement of achievements) {
      await pool.query(
        `
        INSERT INTO achievements (name, description, icon, points_required, waste_required, pickups_required)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `,
        [
          achievement.name,
          achievement.description,
          achievement.icon,
          achievement.points_required,
          achievement.waste_required,
          achievement.pickups_required,
        ],
      )
    }

    // Seed rewards
    const rewards = [
      {
        name: "Safaricom Airtime",
        description: "KES 100 airtime credit",
        category: "Airtime",
        points_cost: 500,
        value_kes: 100,
        stock_quantity: -1,
      },
      {
        name: "KFC Voucher",
        description: "KES 500 food voucher",
        category: "Food",
        points_cost: 1200,
        value_kes: 500,
        stock_quantity: 100,
      },
      {
        name: "Carrefour Voucher",
        description: "KES 1000 shopping voucher",
        category: "Shopping",
        points_cost: 2000,
        value_kes: 1000,
        stock_quantity: 50,
      },
      {
        name: "Airtel Airtime",
        description: "KES 200 airtime credit",
        category: "Airtime",
        points_cost: 800,
        value_kes: 200,
        stock_quantity: -1,
      },
    ]

    for (const reward of rewards) {
      await pool.query(
        `
        INSERT INTO rewards (name, description, category, points_cost, value_kes, stock_quantity)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `,
        [reward.name, reward.description, reward.category, reward.points_cost, reward.value_kes, reward.stock_quantity],
      )
    }

    // Seed QR bins
    const bins = [
      {
        bin_code: "BIN001",
        location_name: "Kilimani Plaza",
        location_address: "Kilimani Road, Nairobi",
        bin_type: "Mixed",
        location_lat: -1.2921,
        location_lng: 36.7814,
      },
      {
        bin_code: "BIN002",
        location_name: "Westgate Mall",
        location_address: "Westlands, Nairobi",
        bin_type: "Plastic",
        location_lat: -1.2676,
        location_lng: 36.807,
      },
      {
        bin_code: "BIN003",
        location_name: "Karen Shopping Center",
        location_address: "Karen, Nairobi",
        bin_type: "E-waste",
        location_lat: -1.3197,
        location_lng: 36.6859,
      },
      {
        bin_code: "BIN004",
        location_name: "Lavington Mall",
        location_address: "Lavington, Nairobi",
        bin_type: "Organic",
        location_lat: -1.2833,
        location_lng: 36.7667,
      },
    ]

    for (const bin of bins) {
      await pool.query(
        `
        INSERT INTO qr_bins (bin_code, location_name, location_address, bin_type, location_lat, location_lng)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (bin_code) DO NOTHING
      `,
        [bin.bin_code, bin.location_name, bin.location_address, bin.bin_type, bin.location_lat, bin.location_lng],
      )
    }

    // Create demo admin user
    const adminPassword = await bcrypt.hash("admin123", 10)
    await pool.query(
      `
      INSERT INTO users (name, email, phone, password_hash, points, level, has_completed_onboarding)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING
    `,
      ["Admin User", "admin@smartwaste.ke", "+254700000000", adminPassword, 0, "Admin", true],
    )

    // Create demo collector
    const collectorPassword = await bcrypt.hash("collector123", 10)
    const collectorResult = await pool.query(
      `
      INSERT INTO users (name, email, phone, password_hash, points, level, has_completed_onboarding)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `,
      ["Samuel Kiprotich", "collector@smartwaste.ke", "+254712345678", collectorPassword, 2450, "Eco Champion", true],
    )

    if (collectorResult.rows.length > 0) {
      await pool.query(
        `
        INSERT INTO collectors (user_id, license_number, vehicle_type, service_areas, rating, total_collections, total_earnings, is_verified, is_available)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT DO NOTHING
      `,
        [collectorResult.rows[0].id, "COL001", "Pickup Truck", ["Nairobi", "Kiambu"], 4.9, 156, 15600, true, true],
      )
    }

    console.log("✅ Database seeded successfully")
  } catch (error) {
    console.error("❌ Seeding error:", error)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0))
}

module.exports = { seedDatabase }
