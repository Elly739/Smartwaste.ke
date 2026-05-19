import app from "./app.js";
import { initializeDatabase } from "./data/database.js";

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

try {
  console.log(`[${new Date().toISOString()}] Initializing SmartWaste database...`);
  await initializeDatabase();
  console.log(`[${new Date().toISOString()}] Database initialized successfully`);

  app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] SmartWaste server running on http://localhost:${PORT}`);
    console.log(`[${new Date().toISOString()}] Environment: ${NODE_ENV}`);
    console.log(`[${new Date().toISOString()}] Log Level: ${LOG_LEVEL}`);
  });
} catch (error) {
  console.error(`[${new Date().toISOString()}] Failed to start SmartWaste server:`, error);
  process.exit(1);
}
