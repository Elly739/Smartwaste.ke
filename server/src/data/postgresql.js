import pg from "pg";
import { randomUUID } from "node:crypto";
import { hashPassword } from "../utils/passwords.js";

const { Pool } = pg;

// Create connection pool for PostgreSQL
let pool = null;

function getPool() {
  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is required for PostgreSQL. " +
      "Provide a Neon PostgreSQL connection string or set USE_SQLITE=true for development."
    );
  }

  pool = new Pool({
    connectionString: databaseUrl,
    // Connection pool settings
    max: parseInt(process.env.DATABASE_POOL_SIZE || "10"),
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || "30000"),
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || "2000"),
  });

  pool.on("error", (err) => {
    console.error("[PostgreSQL Pool] Unexpected error on idle client:", err);
  });

  return pool;
}

// Query execution functions with backward-compatible interface
async function run(sql, params = []) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const result = await client.query(sql, params);
    return {
      lastID: result.rows[0]?.id,
      changes: result.rowCount,
    };
  } finally {
    client.release();
  }
}

async function get(sql, params = []) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const result = await client.query(sql, params);
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

async function all(sql, params = []) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

async function seedPrivateAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "iamellyokello@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AGXR4X45";
  const adminName = process.env.ADMIN_NAME || "Elly Admin";

  const existingAdmin = await get(
    "SELECT id FROM users WHERE email = $1",
    [adminEmail]
  );

  if (existingAdmin) {
    return;
  }

  await run(
    `INSERT INTO users (id, name, email, password, role, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      randomUUID(),
      adminName,
      adminEmail,
      hashPassword(adminPassword),
      "admin",
      new Date().toISOString(),
    ]
  );
}

export async function initializeDatabase() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL
      )
    `);

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create disposal_events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS disposal_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        bin_id TEXT NOT NULL,
        waste_type TEXT NOT NULL,
        points_earned INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("[PostgreSQL] Database schema initialized successfully");
    await seedPrivateAdmin();
  } finally {
    client.release();
  }
}

// Close pool gracefully on app shutdown
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("[PostgreSQL] Connection pool closed");
  }
}

export { all, get, run };
