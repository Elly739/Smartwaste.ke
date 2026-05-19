import express from "express";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import disposalRoutes from "./routes/disposalRoutes.js";

const app = express();

// Middleware
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const logLevel = process.env.LOG_LEVEL || "info";
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`;
    
    if (logLevel === "info") {
      console.log(`[${new Date().toISOString()}] ${logMessage}`);
    }
  });
  
  next();
});

// CORS Middleware
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", corsOrigin);
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", disposalRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((error, req, res, next) => {
  const logLevel = process.env.LOG_LEVEL || "info";
  
  if (logLevel === "info" || logLevel === "debug") {
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
    if (logLevel === "debug") {
      console.error(error.stack);
    }
  }

  // Default to 500 if no status code
  const status = error.status || 500;
  const message = error.message || "Internal server error";
  
  res.status(status).json({ 
    message,
    ...(process.env.NODE_ENV === "development" && { error: error.message })
  });
});

export default app;
