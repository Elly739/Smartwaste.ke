const pool = require("./connection")

const createTables = async () => {
  try {
    console.log("🔄 Running database migrations...")

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        points INTEGER DEFAULT 0,
        total_waste_recycled DECIMAL(10,2) DEFAULT 0,
        level VARCHAR(50) DEFAULT 'Eco Beginner',
        has_completed_onboarding BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Pickup requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pickup_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        collector_id UUID REFERENCES users(id) ON DELETE SET NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('Plastic', 'Organic', 'E-waste')),
        status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Collected', 'Completed', 'Cancelled')),
        weight DECIMAL(10,2),
        points_earned INTEGER DEFAULT 0,
        location_lat DECIMAL(10,8),
        location_lng DECIMAL(11,8),
        location_address TEXT,
        notes TEXT,
        scheduled_at TIMESTAMP,
        collected_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        points_required INTEGER DEFAULT 0,
        waste_required DECIMAL(10,2) DEFAULT 0,
        pickups_required INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // User achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_id)
      );
    `)

    // Rewards table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        points_cost INTEGER NOT NULL,
        value_kes DECIMAL(10,2),
        is_available BOOLEAN DEFAULT TRUE,
        stock_quantity INTEGER DEFAULT -1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Reward redemptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reward_redemptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
        points_spent INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
        redemption_code VARCHAR(50),
        redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      );
    `)

    // QR Bins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS qr_bins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bin_code VARCHAR(50) UNIQUE NOT NULL,
        location_name VARCHAR(255) NOT NULL,
        location_lat DECIMAL(10,8),
        location_lng DECIMAL(11,8),
        location_address TEXT,
        bin_type VARCHAR(20) CHECK (bin_type IN ('Plastic', 'Organic', 'E-waste', 'Mixed')),
        status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Inactive')),
        last_scan_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Collectors table (extends users)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collectors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(50),
        vehicle_type VARCHAR(50),
        service_areas TEXT[],
        rating DECIMAL(3,2) DEFAULT 5.0,
        total_collections INTEGER DEFAULT 0,
        total_earnings DECIMAL(10,2) DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        collector_id UUID REFERENCES collectors(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(20) DEFAULT 'M-Pesa',
        phone_number VARCHAR(20),
        transaction_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_pickup_requests_user_id ON pickup_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON pickup_requests(status);
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
      CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_qr_bins_code ON qr_bins(bin_code);
      CREATE INDEX IF NOT EXISTS idx_collectors_user_id ON collectors(user_id);
    `)

    console.log("✅ Database migrations completed successfully")
  } catch (error) {
    console.error("❌ Migration error:", error)
    process.exit(1)
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  createTables().then(() => process.exit(0))
}

module.exports = { createTables }
