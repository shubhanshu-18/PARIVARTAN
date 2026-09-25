require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const { pool } = require("./database");
const apiRoutes = require("./routes/api");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
const frontendDistPath = path.join(__dirname, "dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const normalizeOrigin = (value) => value.trim().replace(/\/+$/, "");
const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ORIGIN,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  "https://parivartan-tau.vercel.app",
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map(normalizeOrigin)
  .filter(Boolean);
const allowedOrigins = [...new Set(configuredOrigins)];
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
  allowedOrigins.push("http://localhost:5174");
  allowedOrigins.push("http://localhost:5175");
}

// Security & headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS setup
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lightweight In-Memory Rate Limiter (No external dependency required)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 req/min per IP

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else {
    const record = requestCounts.get(ip);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + RATE_LIMIT_WINDOW_MS;
    } else {
      record.count++;
      if (record.count > MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
          error: "Too many requests. Please slow down and try again shortly.",
          retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
        });
      }
    }
  }
  next();
});

// Periodic cleanup of rate limit cache
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
      if (now > record.resetTime) {
        requestCounts.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);

// API Routes
app.use("/api", apiRoutes);

// Serve the built React app when running the production server. Checking for
// the build also keeps `npm start` useful locally after `npm run build`.
if (process.env.NODE_ENV === "production" || fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));

  // Let the client-side application handle non-API routes, including refreshes.
  app.get("*", (req, res, next) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      return next();
    }

    res.sendFile(frontendIndexPath, (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error occurred",
    ...(err.validationErrors ? { validationErrors: err.validationErrors } : {}),
    timestamp: new Date().toISOString(),
  });
});

// Ensure the users table exists before accepting requests
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
    `);
  } catch (err) {
    console.warn("Auto-migration skipped (users table):", err.message);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏛️  Gram Sarthi AI API Server (SIH 2026 - PS 26091)`);
    console.log(
      `🚀  Port: ${PORT} | Mode: ${process.env.NODE_ENV || "development"}`,
    );
    console.log(`🌐  API Health: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
})();
