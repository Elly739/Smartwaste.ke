import { getAdminOverview } from "../data/disposalStore.js";

export async function getAdminDashboard(req, res) {
  const overview = await getAdminOverview();
  return res.json({ overview });
}