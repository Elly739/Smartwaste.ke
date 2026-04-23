import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

export function isHashedPassword(password) {
  return typeof password === "string" && password.startsWith("scrypt$");
}

export function verifyPassword(password, storedPassword) {
  if (!isHashedPassword(storedPassword)) {
    return password === storedPassword;
  }

  const [, salt, storedHash] = storedPassword.split("$");
  const derivedKey = scryptSync(password, salt, 64);
  const storedKey = Buffer.from(storedHash, "hex");

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}