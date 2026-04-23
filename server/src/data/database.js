import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "node:url";
import { hashPassword } from "../utils/passwords.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, "../../data");
const databasePath = path.join(dataDirectory, "smartwaste.sqlite");

fs.mkdirSync(dataDirectory, { recursive: true });

const database = new sqlite3.Database(databasePath);

function run(sql, params = []) {
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

function get(sql, params = []) {
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

function all(sql, params = []) {
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

async function seedPrivateAdmin() {
  const adminEmail = "iamellyokello@gmail.com";
  const existingAdmin = await get(
    "SELECT id FROM users WHERE email = ?",
    [adminEmail],
  );

  if (existingAdmin) {
    return;
  }

  await run(
    `INSERT INTO users (id, name, email, password, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      "Elly Admin",
      adminEmail,
      hashPassword("AGXR4X45"),
      "admin",
      new Date().toISOString(),
    ],
  );
}

export async function initializeDatabase() {
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

  await seedPrivateAdmin();
}

export { all, databasePath, get, run };