import { randomUUID } from "node:crypto";
import { saveDisposalEvent } from "../data/disposalStore.js";

const VALID_WASTE_TYPES = new Set(["plastic", "organic", "general"]);
const POINTS_PER_DISPOSAL = 10;

export async function createDisposalEvent(req, res) {
  const { wasteType, binId = "BIN-001" } = req.body ?? {};

  if (!VALID_WASTE_TYPES.has(wasteType)) {
    return res.status(400).json({
      message: "Invalid waste type. Use plastic, organic, or general.",
    });
  }

  const event = await saveDisposalEvent({
    id: randomUUID(),
    userId: req.user.id,
    userName: req.user.name,
    binId,
    wasteType,
    pointsEarned: POINTS_PER_DISPOSAL,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    message: "Disposal recorded successfully.",
    event,
    pointsEarned: event.pointsEarned,
  });
}