import app from "./app.js";
import { initializeDatabase } from "./data/database.js";

const PORT = process.env.PORT || 4000;

try {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`SmartWaste server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Failed to start SmartWaste server:", error);
  process.exit(1);
}