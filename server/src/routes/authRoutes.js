import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getCurrentUser);

export default router;
