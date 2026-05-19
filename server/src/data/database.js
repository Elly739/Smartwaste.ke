import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "node:url";
import { hashPassword } from "../utils/passwords.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine database type: PostgreSQL (DATABASE_URL) or SQLite (default)
const useSQLite = !process.env.DATABASE_URL || process.env.USE_SQLITE === "true";

let database = null;
let databasePath = null;

if (useSQLite) {
  // SQLite configuration
  const databasePathEnv = process.env.DATABASE_PATH || "./data/smartwaste.sqlite";
  databasePath = databasePathEnv === ":memory:" 
    ? ":memory:" 
    : path.resolve(__dirname, "../../..", databasePathEnv);

  // Create data directory only for file-based databases
  if (databasePath !== ":memory:") {
    const dataDirectory = path.dirname(databasePath);
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  database = new sqlite3.Database(databasePath);
  console.log("[Database] Using SQLite at:", databasePath);
} else {
  console.log("[Database] Using PostgreSQL (Neon)");
}

// SQLite query functions
function runSQLite(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getSQLite(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row ?? null);
    });
  });
}

function allSQLite(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

// Wrapper functions that route to correct database
async function run(sql, params = []) {
  if (useSQLite) {
    return runSQLite(sql, params);
  } else {
    const { run: pgRun } = await import("./postgresql.js");
    return pgRun(sql, params);
  }
}

async function get(sql, params = []) {
  if (useSQLite) {
    return getSQLite(sql, params);
  } else {
    const { get: pgGet } = await import("./postgresql.js");
    return pgGet(sql, params);
  }
}

async function all(sql, params = []) {
  if (useSQLite) {
    return allSQLite(sql, params);
  } else {
    const { all: pgAll } = await import("./postgresql.js");
    return pgAll(sql, params);
  }
}

async function seedPrivateAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "iamellyokello@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AGXR4X45";
  const adminName = process.env.ADMIN_NAME || "Elly Admin";
  
  const placeholder = useSQLite ? "?" : "$1";
  
  const existingAdmin = await get(
    `SELECT id FROM users WHERE email = ${placeholder}`,
    [adminEmail],
  );

  if (existingAdmin) {
    return;
  }

  const placeHolders = useSQLite 
    ? "?, ?, ?, ?, ?, ?" 
    : "$1, $2, $3, $4, $5, $6";

  await run(
    `INSERT INTO users (id, name, email, password, role, created_at)
     VALUES (${placeHolders})`,
    [
      randomUUID(),
      adminName,
      adminEmail,
      hashPassword(adminPassword),
      "admin",
      new Date().toISOString(),
    ],
  );
}

export async function initializeDatabase() {
  if (useSQLite) {
    // Initialize SQLite
    await run("PRAGMA foreign_keys = ON");

    await run(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL
      )`,
    );

    await run(
      `CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    );

    await run(
      `CREATE TABLE IF NOT EXISTS disposal_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        bin_id TEXT NOT NULL,
        waste_type TEXT NOT NULL,
        points_earned INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    );

    console.log("[SQLite] Database schema initialized");
  } else {
    // Initialize PostgreSQL
    const { initializeDatabase: pgInitialize } = await import("./postgresql.js");
    await pgInitialize();
  }

  await seedPrivateAdmin();
}

// Graceful shutdown for PostgreSQL
export async function closeDatabase() {
  if (!useSQLite) {
    const { closeDatabase: pgClose } = await import("./postgresql.js");
    await pgClose();
  } else if (database) {
    return new Promise((resolve, reject) => {
      database.close((err) => {
        if (err) reject(err);
        else {
          console.log("[SQLite] Database connection closed");
          resolve();
        }
      });
    });
  }
}

export { all, databasePath, get, run };
