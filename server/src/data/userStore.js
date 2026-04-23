import { randomUUID } from "node:crypto";
import { get, run } from "./database.js";
import {
  hashPassword,
  isHashedPassword,
  verifyPassword,
} from "../utils/passwords.js";

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

export async function createUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await get(
    "SELECT id FROM users WHERE email = ?",
    [normalizedEmail],
  );

  if (existingUser) {
    throw new Error("An account with that email already exists.");
  }

  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password: hashPassword(password),
    role: "user",
    createdAt: new Date().toISOString(),
  };

  await run(
    `INSERT INTO users (id, name, email, password, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user.id, user.name, user.email, user.password, user.role, user.createdAt],
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function authenticateUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await get(
    `SELECT id, name, email, role, created_at, password
     FROM users
     WHERE email = ?`,
    [normalizedEmail],
  );

  if (!user || !verifyPassword(password, user.password)) {
    throw new Error("Invalid email or password.");
  }

  if (!isHashedPassword(user.password)) {
    await run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashPassword(password), user.id],
    );
  }

  return sanitizeUser(user);
}

export async function createSession(userId) {
  const token = randomUUID();

  await run(
    `INSERT INTO sessions (token, user_id, created_at)
     VALUES (?, ?, ?)`,
    [token, userId, new Date().toISOString()],
  );

  return token;
}

export async function getUserBySessionToken(token) {
  const user = await get(
    `SELECT users.id, users.name, users.email, users.role, users.created_at
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ?`,
    [token],
  );

  return user ? sanitizeUser(user) : null;
}

export async function getUserById(userId) {
  const user = await get(
    `SELECT id, name, email, role, created_at
     FROM users
     WHERE id = ?`,
    [userId],
  );

  return user ? sanitizeUser(user) : null;
}