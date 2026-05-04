const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Helper for consistent JSON responses
const sendJson = (res, status, data) => res.status(status).json(data);

/**
 * DATABASE INITIALIZATION
 */
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT,
        username TEXT,
        role TEXT,
        status TEXT DEFAULT 'approved',
        auth_method TEXT,
        avatar_url TEXT,
        bio TEXT,
        verification_code TEXT
      );
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT,
        time TEXT,
        location TEXT,
        category TEXT,
        organizer TEXT,
        image_url TEXT
      );
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
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        user_email TEXT,
        subject TEXT,
        message TEXT,
        timestamp TEXT,
        status TEXT,
        reply TEXT
      );
      CREATE TABLE IF NOT EXISTS support_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        user_email TEXT,
        request_type TEXT,
        description TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        admin_response TEXT
      );
      INSERT INTO settings (id, hero_title, hero_subtitle, hero_image_url, brand_name)
      VALUES (1, 'Your Gateway to\nCampus Life.', 'Discover campus events.', '/uploads/campus-hero.jpg', 'CampusEvents')
      ON CONFLICT DO NOTHING;
    `);
    console.log("PostgreSQL Synced");
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    client.release();
  }
};
initDb();

// --- API ROUTES ---

// Registration
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  const status = role === 'admin' ? 'pending' : 'approved';
  try {
    const result = await pool.query(
      'INSERT INTO users (id, email, password, name, role, status, auth_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, email, password, name, role || 'user', status, 'email']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Identity Conflict: Email already exists.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password, isGoogle, name, avatarUrl } = req.body;
  try {
    if (isGoogle) {
      let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        const id = 'g-' + Math.random().toString(36).substr(2, 7);
        const role = email.includes('admin') ? 'admin' : 'user';
        result = await pool.query(
          'INSERT INTO users (id, email, name, role, auth_method, avatar_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [id, email, name, role, 'google', avatarUrl, 'approved']
        );
      }
      return res.json(result.rows[0]);
    }

    if (email === 'admin@campus.edu' && password === 'admin123') {
       return res.json({ id: 'master-root', email: 'admin@campus.edu', name: 'Master Admin', role: 'admin', status: 'approved', auth_method: 'email' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      if (result.rows[0].status === 'pending') {
        return res.status(403).json({ message: 'Administrative approval required.' });
      }
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Auth Engine Error' });
  }
});

// User List
app.get('/api/admin/users', async (req, res) => {
  const result = await pool.query("SELECT id, email, name, role, status, auth_method FROM users");
  res.json(result.rows);
});

// Pending Admins
app.get('/api/admin/pending', async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE status = 'pending'");
  res.json(result.rows);
});

// Approval
app.post('/api/admin/approve', async (req, res) => {
  const { userId, action } = req.body;
  const status = action === 'approve' ? 'approved' : 'rejected';
  await pool.query("UPDATE users SET status = $1 WHERE id = $2", [status, userId]);
  res.json({ success: true });
});

// Events
app.get('/api/events', async (req, res) => {
  const result = await pool.query('SELECT * FROM events');
  res.json(result.rows);
});

app.post('/api/events', async (req, res) => {
  const { title, description, date, time, location, category, organizer, imageUrl } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  const result = await pool.query(
    'INSERT INTO events (id, title, description, date, time, location, category, organizer, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [id, title, description, date, time, location, category, organizer, imageUrl]
  );
  res.status(201).json(result.rows[0]);
});

app.delete('/api/events/:id', async (req, res) => {
  await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
  res.status(204).send();
});

// Settings
app.get('/api/settings', async (req, res) => {
  const result = await pool.query('SELECT * FROM settings WHERE id = 1');
  res.json(result.rows[0]);
});

app.post('/api/settings', async (req, res) => {
  const updates = req.body;
  const fields = Object.keys(updates).map((key, i) => `${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = $${i + 1}`).join(', ');
  const values = Object.values(updates);
  await pool.query(`UPDATE settings SET ${fields} WHERE id = 1`, values);
  res.json({ success: true });
});

// Support
app.post('/api/support', async (req, res) => {
  const { userId, userName, userEmail, requestType, description } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  const result = await pool.query(
    'INSERT INTO support_requests (id, user_id, user_name, user_email, request_type, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [id, userId, userName, userEmail, requestType, description]
  );
  res.status(201).json(result.rows[0]);
});

app.get('/api/support', async (req, res) => {
  const { email } = req.query;
  const result = email 
    ? await pool.query('SELECT * FROM support_requests WHERE user_email = $1 ORDER BY created_at DESC', [email])
    : await pool.query('SELECT * FROM support_requests ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/support/reply', async (req, res) => {
  const { requestId, response } = req.body;
  await pool.query("UPDATE support_requests SET admin_response = $1, status = 'closed' WHERE id = $2", [response, requestId]);
  res.json({ success: true });
});

// --- CATCH-ALL API FAIL-SAFE (MUST BE JSON) ---
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint Unmapped', path: req.originalUrl });
});

// Static Serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

app.listen(PORT, () => console.log(`Backend Active: ${PORT}`));
