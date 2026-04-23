import { Router } from "express";
import { getAdminDashboard } from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/overview", requireAuth, requireAdmin, getAdminDashboard);

export default router;