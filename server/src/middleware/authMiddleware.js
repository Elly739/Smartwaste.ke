import { getUserBySessionToken } from "../data/userStore.js";

export async function requireAuth(req, res, next) {
  const authorizationHeader = req.headers.authorization ?? "";
  const token = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice(7)
    : "";
  const user = await getUserBySessionToken(token);

  if (!user) {
    return res.status(401).json({
      message: "Please sign in to continue.",
    });
  }

  req.user = user;
  return next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only.",
    });
  }

  return next();
}