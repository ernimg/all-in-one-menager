const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

/**
 * server.js - Minimal Node + Express server template
 *
 * Usage:
 *   node server.js
 *
 * Features:
 * - Express with JSON body parsing
 * - CORS, Helmet security headers
 * - Morgan logging in development
 * - Basic routes: /, /health, /api/example
 * - 404 and centralized error handler
 * - Graceful shutdown
 */

("use strict");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (NODE_ENV === "development") app.use(morgan("dev"));

// Example static folder (uncomment if needed)
// app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "AllInOneManager backend running", env: NODE_ENV });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/example", async (req, res) => {
  // placeholder for async logic (DB call, etc.)
  res.json({ data: "example response" });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const payload = {
    error: err.message || "Internal Server Error",
  };
  if (NODE_ENV === "development") payload.stack = err.stack;
  res.status(status).json(payload);
});

// Start server with graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (env: ${NODE_ENV})`);
});

const shutdown = (signal) => {
  console.log(`Received ${signal}. Closing server...`);
  server.close((err) => {
    if (err) {
      console.error("Error during shutdown", err);
      process.exit(1);
    }
    console.log("Server closed. Exiting.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Export app for testing or serverless adapters
module.exports = app;
