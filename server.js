import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===== MySQL Pool =====
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT),
});

// ===== DATABASE INITIALIZATION =====
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT,
        name TEXT,
        username TEXT,
        role TEXT,
        status TEXT DEFAULT 'approved',
        auth_method TEXT,
        avatar_url TEXT,
        bio TEXT,
        verification_code TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(50) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT,
        time TEXT,
        location TEXT,
        category TEXT,
        organizer TEXT,
        image_url TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        hero_title TEXT,
        hero_subtitle TEXT,
        hero_image_url TEXT,
        site_logo TEXT,
        brand_name TEXT,
        footer_desc TEXT,
        contact_email TEXT,
        contact_phone TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(50) PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        user_email TEXT,
        subject TEXT,
        message TEXT,
        timestamp TEXT,
        status TEXT,
        reply TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_requests (
        id VARCHAR(50) PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        user_email TEXT,
        request_type TEXT,
        description TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        admin_response TEXT
      )
    `);

    await pool.query(`
      INSERT IGNORE INTO settings 
        (id, hero_title, hero_subtitle, hero_image_url, brand_name)
      VALUES 
        (1, 'Your Gateway to Campus Life.', 'Discover campus events.', '/uploads/campus-hero.jpg', 'CampusEvents')
    `);

    console.log("MySQL Synced");
  } catch (err) {
    console.error("DB Error:", err);
  }
};

initDb();

// ===== API ROUTES =====

// Registration
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  const status = role === "admin" ? "pending" : "approved";

  try {
    const [result] = await pool.query(
      "INSERT INTO users (id, email, password, name, role, status, auth_method) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, email, password, name, role || "user", status, "email"]
    );

    res.status(201).json({ id, email, name, role, status, auth_method: "email" });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Identity Conflict: Email already exists.",
    });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password, isGoogle, name, avatarUrl } = req.body;

  try {
    // Google Login
    if (isGoogle) {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        const id = "g-" + Math.random().toString(36).substr(2, 7);
        const role = email.includes("admin") ? "admin" : "user";

        await pool.query(
          "INSERT INTO users (id, email, name, role, auth_method, avatar_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [id, email, name, role, "google", avatarUrl, "approved"]
        );

        return res.json({ id, email, name, role, auth_method: "google", status: "approved" });
      }

      return res.json(rows[0]);
    }

    // Master Admin Shortcut
    if (email === "admin@campus.edu" && password === "admin123") {
      return res.json({
        id: "master-root",
        email: "admin@campus.edu",
        name: "Master Admin",
        role: "admin",
        status: "approved",
        auth_method: "email",
      });
    }

    // Regular Login
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length > 0) {
      if (rows[0].status === "pending") {
        return res.status(403).json({ message: "Administrative approval required." });
      }
      return res.json(rows[0]);
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ message: "Auth Engine Error" });
  }
});

// User List
app.get("/api/admin/users", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, email, name, role, status, auth_method FROM users"
  );
  res.json(rows);
});

// Pending Admins
app.get("/api/admin/pending", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE status = 'pending'"
  );
  res.json(rows);
});

// Approval
app.post("/api/admin/approve", async (req, res) => {
  const { userId, action } = req.body;
  const status = action === "approve" ? "approved" : "rejected";

  await pool.query("UPDATE users SET status = ? WHERE id = ?", [status, userId]);
  res.json({ success: true });
});

// Get All Events
app.get("/api/events", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM events");
  res.json(rows);
});

// Create Event
app.post("/api/events", async (req, res) => {
  const { title, description, date, time, location, category, organizer, imageUrl } = req.body;
  const id = Math.random().toString(36).substr(2, 9);

  await pool.query(
    "INSERT INTO events (id, title, description, date, time, location, category, organizer, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, title, description, date, time, location, category, organizer, imageUrl]
  );

  res.status(201).json({ id, title, description, date, time, location, category, organizer, image_url: imageUrl });
});

// Delete Event
app.delete("/api/events/:id", async (req, res) => {
  await pool.query("DELETE FROM events WHERE id = ?", [req.params.id]);
  res.json({ message: "Event deleted successfully" });
});

// Get Settings
app.get("/api/settings", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1");
  res.json(rows[0]);
});

// Update Settings
app.post("/api/settings", async (req, res) => {
  const updates = req.body;

  // Convert camelCase keys to snake_case for MySQL columns
  const fields = Object.keys(updates)
    .map((key) => `${key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)} = ?`)
    .join(", ");

  const values = Object.values(updates);

  await pool.query(`UPDATE settings SET ${fields} WHERE id = 1`, values);
  res.json({ success: true });
});

// Create Support Request
app.post("/api/support", async (req, res) => {
  const { userId, userName, userEmail, requestType, description } = req.body;
  const id = Math.random().toString(36).substr(2, 9);

  const [result] = await pool.query(
    "INSERT INTO support_requests (id, user_id, user_name, user_email, request_type, description) VALUES (?, ?, ?, ?, ?, ?)",
    [id, userId, userName, userEmail, requestType, description]
  );

  res.status(201).json({ id, user_id: userId, user_name: userName, user_email: userEmail, request_type: requestType, description, status: "open" });
});

// Get Support Requests
app.get("/api/support", async (req, res) => {
  const { email } = req.query;

  const [rows] = email
    ? await pool.query(
        "SELECT * FROM support_requests WHERE user_email = ? ORDER BY created_at DESC",
        [email]
      )
    : await pool.query(
        "SELECT * FROM support_requests ORDER BY created_at DESC"
      );

  res.json(rows);
});

// Reply to Support Request
app.post("/api/support/reply", async (req, res) => {
  const { requestId, response } = req.body;

  await pool.query(
    "UPDATE support_requests SET admin_response = ?, status = 'closed' WHERE id = ?",
    [response, requestId]
  );

  res.json({ success: true });
});

// ===== CATCH-ALL API FAIL-SAFE =====
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint Unmapped",
    path: req.originalUrl,
  });
});

// ===== STATIC ROUTES =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

// Production catch-all
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// ===== START =====
app.listen(PORT, () => {
  console.log(`🎩 Running at http://localhost:${PORT}`);
});
