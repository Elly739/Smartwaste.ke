import { Router } from "express";
import { createDisposalEvent } from "../controllers/disposalController.js";
import { getDisposalEvents } from "../data/disposalStore.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/disposals", requireAuth, async (req, res) => {
  const events = await getDisposalEvents(req.user.id);
  res.json({ events });
});

router.post("/dispose", requireAuth, createDisposalEvent);

export default router;