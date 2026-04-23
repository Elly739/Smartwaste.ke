import {
  authenticateUser,
  createSession,
  createUser,
  getUserBySessionToken,
} from "../data/userStore.js";

function issueAuthResponse(user) {
  return createSession(user.id).then((token) => ({
    token,
    user,
  }));
}

export async function registerUser(req, res) {
  const { name, email, password } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({
      message: "Name, email, and password are required.",
    });
  }

  try {
    const user = await createUser({ name, email, password });
    return res.status(201).json(await issueAuthResponse(user));
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body ?? {};

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  try {
    const user = await authenticateUser({ email, password });
    return res.json(await issueAuthResponse(user));
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
}

export async function getCurrentUser(req, res) {
  const authorizationHeader = req.headers.authorization ?? "";
  const token = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice(7)
    : "";
  const user = await getUserBySessionToken(token);

  if (!user) {
    return res.status(401).json({
      message: "Not authenticated.",
    });
  }

  return res.json({ user });
}