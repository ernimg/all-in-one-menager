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

require("dotenv").config();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// PostgreSQL setup (configure via env vars)
const { Pool } = require("pg");
const PGHOST = process.env.PGHOST || "localhost";
const PGPORT = process.env.PGPORT || 5432;
const PGUSER = process.env.PGUSER || "postgres";
const PGPASSWORD = process.env.PGPASSWORD || "";
const PGDATABASE = process.env.PGDATABASE || "allinone_manager";

const pool = new Pool({
  host: PGHOST,
  port: PGPORT,
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
});

// Ensure users and apps tables exist
const ensureUsersTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(sql);
};

const ensureAppsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS apps (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      meta JSONB NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(sql);
};

// Ensure notifications table exists
const ensureNotificationsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT,
      type VARCHAR(50),
      priority INTEGER,
      user_id VARCHAR(255),
      read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP NULL,
      meta JSONB NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(sql);
};

ensureNotificationsTable().catch((err) => {
  console.error("Failed to ensure notifications table:", err);
});

// ensure other tables and create seed admin
const ensureCoreTables = async () => {
  await ensureUsersTable();
  await ensureAppsTable();

  // seed admin if not exists
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPass = process.env.ADMIN_PASSWORD || "Password123!";
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    adminEmail,
  ]);
  if (rows.length === 0) {
    const hash = await bcrypt.hash(adminPass, 10);
    const insert = await pool.query(
      "INSERT INTO users(email,password_hash,name,role) VALUES($1,$2,$3,$4) RETURNING *",
      [adminEmail, hash, "Administrator", "admin"]
    );
    console.log("Seeded admin user:", insert.rows[0].email);
  }
};

ensureCoreTables().catch((err) =>
  console.error("Failed to ensure core tables:", err)
);

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

// --- Auth helpers ---
const authenticateJWT = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ error: "Missing Authorization" });
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ error: "Invalid Authorization" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ error: "Forbidden" });
  next();
};

// Auth endpoints
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (!rows[0]) return res.status(401).json({ error: "Invalid credentials" });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { sub: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Users CRUD (admin only)
app.get(
  "/api/users",
  authenticateJWT,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        "SELECT id,email,name,role,active,created_at FROM users ORDER BY id DESC"
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

app.post(
  "/api/users",
  authenticateJWT,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password)
        return res.status(400).json({ error: "email and password required" });
      const hash = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        "INSERT INTO users(email,password_hash,name,role) VALUES($1,$2,$3,$4) RETURNING id,email,name,role,active",
        [email, hash, name || null, role || "user"]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.get(
  "/api/users/:id",
  authenticateJWT,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        "SELECT id,email,name,role,active,created_at FROM users WHERE id=$1",
        [req.params.id]
      );
      if (!rows[0]) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.put(
  "/api/users/:id",
  authenticateJWT,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { name, role, active, password } = req.body;
      const updates = [];
      const values = [];
      let idx = 1;
      if (name !== undefined) {
        updates.push(`name = $${idx++}`);
        values.push(name);
      }
      if (role !== undefined) {
        updates.push(`role = $${idx++}`);
        values.push(role);
      }
      if (active !== undefined) {
        updates.push(`active = $${idx++}`);
        values.push(active);
      }
      if (password) {
        const hash = await bcrypt.hash(password, 10);
        updates.push(`password_hash = $${idx++}`);
        values.push(hash);
      }
      if (updates.length === 0)
        return res.status(400).json({ error: "no fields" });
      values.push(req.params.id);
      const sql = `UPDATE users SET ${updates.join(
        ", "
      )} WHERE id=$${idx} RETURNING id,email,name,role,active`;
      const { rows } = await pool.query(sql, values);
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.delete(
  "/api/users/:id",
  authenticateJWT,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        "DELETE FROM users WHERE id=$1 RETURNING id,email",
        [req.params.id]
      );
      if (!rows[0]) return res.status(404).json({ error: "Not found" });
      res.json({ deleted: rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// Apps CRUD (admin/manager)
app.get(
  "/api/apps",
  authenticateJWT,
  requireRole(["admin", "manager"]),
  async (req, res, next) => {
    try {
      const { rows } = await pool.query("SELECT * FROM apps ORDER BY id DESC");
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

app.post(
  "/api/apps",
  authenticateJWT,
  requireRole(["admin", "manager"]),
  async (req, res, next) => {
    try {
      const { name, slug, description, meta, owner_id } = req.body;
      const { rows } = await pool.query(
        "INSERT INTO apps(name,slug,description,meta,owner_id) VALUES($1,$2,$3,$4,$5) RETURNING *",
        [name, slug, description || null, meta || null, owner_id || null]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.put(
  "/api/apps/:id",
  authenticateJWT,
  requireRole(["admin", "manager"]),
  async (req, res, next) => {
    try {
      const { name, description, meta } = req.body;
      const { rows } = await pool.query(
        "UPDATE apps SET name=$1, description=$2, meta=$3, updated_at=NOW() WHERE id=$4 RETURNING *",
        [name, description || null, meta || null, req.params.id]
      );
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

app.delete(
  "/api/apps/:id",
  authenticateJWT,
  requireRole(["admin", "manager"]),
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        "DELETE FROM apps WHERE id=$1 RETURNING *",
        [req.params.id]
      );
      if (!rows[0]) return res.status(404).json({ error: "Not found" });
      res.json({ deleted: rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

/* Notifications endpoints (Postgres) */
app.get("/api/notifications", async (req, res, next) => {
  try {
    const userId = req.query.userId || req.header("X-User-Id") || null;
    const unreadOnly = req.query.unreadOnly === "true";
    const values = [];
    let where = "";
    if (userId) {
      values.push(userId);
      where = `WHERE user_id = $${values.length}`;
    }
    if (unreadOnly) {
      where = where ? `${where} AND read = false` : `WHERE read = false`;
    }
    const sql = `SELECT * FROM notifications ${where} ORDER BY created_at DESC`;
    const { rows } = await pool.query(sql, values);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post("/api/notifications", async (req, res, next) => {
  try {
    const { title, message, type, priority, user_id, meta } = req.body;
    const sql = `INSERT INTO notifications(title, message, type, priority, user_id, meta) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;
    const values = [
      title,
      message || null,
      type || null,
      priority || null,
      user_id || null,
      meta || null,
    ];
    const { rows } = await pool.query(sql, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put("/api/notifications/:id/read", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sql = `UPDATE notifications SET read = true, read_at = NOW() WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(sql, [id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put("/api/notifications/mark-all-read", async (req, res, next) => {
  try {
    const userId = req.query.userId || req.header("X-User-Id") || null;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const sql = `UPDATE notifications SET read = true, read_at = NOW() WHERE user_id = $1 RETURNING *`;
    const { rows } = await pool.query(sql, [userId]);
    res.json({ updated: rows.length });
  } catch (err) {
    next(err);
  }
});

app.delete("/api/notifications/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sql = `DELETE FROM notifications WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(sql, [id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: rows[0] });
  } catch (err) {
    next(err);
  }
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
