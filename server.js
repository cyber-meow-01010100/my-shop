const express = require('express');
const session = require('express-session');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt  = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const mysql   = require('mysql2/promise');

const app  = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// DATABASE POOL
// ============================================================
const db = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'alchimia',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4',
});

// Run on startup — creates all tables if they don't exist
async function initDB() {
  const conn = await db.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id            VARCHAR(64)    NOT NULL PRIMARY KEY,
        name          VARCHAR(255)   NOT NULL,
        category      VARCHAR(100)   DEFAULT '',
        sku           VARCHAR(100)   DEFAULT '',
        price         DECIMAL(10,2)  NOT NULL DEFAULT 0,
        discount_price DECIMAL(10,2) DEFAULT NULL,
        stock         INT            DEFAULT 0,
        unit          VARCHAR(50)    DEFAULT '',
        origin        VARCHAR(100)   DEFAULT '',
        description   TEXT           DEFAULT '',
        details       TEXT           DEFAULT '',
        tags          JSON           DEFAULT (JSON_ARRAY()),
        featured      TINYINT(1)     DEFAULT 0,
        new_arrival   TINYINT(1)     DEFAULT 0,
        best_seller   TINYINT(1)     DEFAULT 0,
        active        TINYINT(1)     DEFAULT 1,
        images        JSON           DEFAULT (JSON_ARRAY()),
        icon          VARCHAR(100)   DEFAULT 'leafBottle',
        created_at    DATETIME       DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          VARCHAR(64)   NOT NULL PRIMARY KEY,
        first_name  VARCHAR(100)  DEFAULT '',
        last_name   VARCHAR(100)  DEFAULT '',
        name        VARCHAR(200)  NOT NULL,
        email       VARCHAR(255)  NOT NULL UNIQUE,
        password    VARCHAR(255)  DEFAULT NULL,
        picture     TEXT          DEFAULT NULL,
        provider    VARCHAR(20)   DEFAULT 'email',
        google_id   VARCHAR(100)  DEFAULT NULL,
        created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS pageviews (
        id        BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
        url       VARCHAR(500) NOT NULL,
        referrer  VARCHAR(500) DEFAULT '',
        device    VARCHAR(20)  DEFAULT 'desktop',
        ts        DATETIME     DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ts (ts)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS events (
        id      BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
        target  VARCHAR(100) DEFAULT '',
        label   VARCHAR(255) DEFAULT '',
        url     VARCHAR(500) NOT NULL,
        ts      DATETIME     DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ts (ts)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Database tables ready.');
  } finally {
    conn.release();
  }
}

// ============================================================
// UPLOADS DIRECTORY
// ============================================================
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret:            process.env.SESSION_SECRET || 'alchimia-dev-secret',
  resave:            false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));
app.use('/uploads', express.static(UPLOADS_DIR));

// ============================================================
// MULTER — image uploads
// ============================================================
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req,  file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /jpeg|jpg|png|gif|webp/.test(file.mimetype));
  }
});

// ============================================================
// DYNAMIC CONFIG — exposes safe keys to frontend
// ============================================================
app.get('/js/config.js', (_req, res) => {
  res.type('application/javascript');
  res.send(`window.ALCHIMIA_CONFIG = ${JSON.stringify({
    GOOGLE_CLIENT_ID:      process.env.GOOGLE_CLIENT_ID      || '',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
    PAYPAL_CLIENT_ID:      process.env.PAYPAL_CLIENT_ID      || '',
    API_BASE_URL:          process.env.API_BASE_URL           || '',
    CURRENCY:              'USD',
    CURRENCY_SYMBOL:       '$'
  })};`);
});

// ============================================================
// ADMIN AUTH
// ============================================================
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'alchimia2026';

function requireAdminAuth(req, res, next) {
  if (req.session && req.session.adminLoggedIn) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/login.php', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.adminLoggedIn = true;
    req.session.username = username;
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/logout.php', (req, res) => {
  req.session.adminLoggedIn = false;
  req.session.username = null;
  res.json({ success: true });
});

app.get('/api/me.php', (req, res) => {
  res.json({
    loggedIn: !!(req.session && req.session.adminLoggedIn),
    username: (req.session && req.session.username) || null
  });
});

// ============================================================
// USER AUTH
// ============================================================
function safeUser(u) {
  const { password, ...rest } = u;
  return rest;
}

async function verifyGoogleToken(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');
  const client = new OAuth2Client(clientId);
  const ticket  = await client.verifyIdToken({ idToken: credential, audience: clientId });
  return ticket.getPayload();
}

// POST /auth/register
app.post('/auth/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const emailLc = email.toLowerCase().trim();
  try {
    const [rows] = await db.query('SELECT id, provider FROM users WHERE email = ?', [emailLc]);
    if (rows.length > 0) {
      if (rows[0].provider === 'google')
        return res.status(409).json({ error: 'This email is registered with Google Sign-In. Please use "Sign in with Google".' });
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const id   = uuidv4();
    const name = `${firstName.trim()} ${lastName.trim()}`;

    await db.query(
      `INSERT INTO users (id, first_name, last_name, name, email, password, provider)
       VALUES (?, ?, ?, ?, ?, ?, 'email')`,
      [id, firstName.trim(), lastName.trim(), name, emailLc, hash]
    );

    const user = { id, firstName: firstName.trim(), lastName: lastName.trim(), name, email: emailLc, picture: null, provider: 'email' };
    req.session.userId = id;
    req.session.user   = user;
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const emailLc = email.toLowerCase().trim();
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [emailLc]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'No account found with that email.' });

    const user = rows[0];
    if (user.provider === 'google')
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please click "Sign in with Google".' });
    if (!user.password)
      return res.status(401).json({ error: 'Incorrect password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Incorrect password.' });

    const safe = safeUser(user);
    req.session.userId = user.id;
    req.session.user   = safe;
    res.json({ success: true, user: safe });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// POST /auth/google
app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No credential provided.' });

  let payload;
  try {
    payload = await verifyGoogleToken(credential);
  } catch (err) {
    console.error('Google token verification failed:', err.message);
    if (err.message.includes('not configured'))
      return res.status(503).json({ error: 'Google Sign-In is not configured on this server.' });
    return res.status(401).json({ error: 'Invalid Google credential. Please try again.' });
  }

  const emailLc = payload.email.toLowerCase();
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [emailLc]);
    let user;

    if (rows.length === 0) {
      const id        = uuidv4();
      const firstName = payload.given_name  || payload.name.split(' ')[0] || '';
      const lastName  = payload.family_name || payload.name.split(' ').slice(1).join(' ') || '';
      await db.query(
        `INSERT INTO users (id, first_name, last_name, name, email, picture, provider, google_id)
         VALUES (?, ?, ?, ?, ?, ?, 'google', ?)`,
        [id, firstName, lastName, payload.name, emailLc, payload.picture || null, payload.sub]
      );
      user = { id, first_name: firstName, last_name: lastName, name: payload.name, email: emailLc, picture: payload.picture || null, provider: 'google' };
    } else {
      user = rows[0];
      // Refresh picture if changed
      if (payload.picture && user.picture !== payload.picture) {
        await db.query('UPDATE users SET picture = ? WHERE id = ?', [payload.picture, user.id]);
        user.picture = payload.picture;
      }
    }

    const safe = safeUser(user);
    req.session.userId = user.id;
    req.session.user   = safe;
    res.json({ success: true, user: safe });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// GET /auth/me
app.get('/auth/me', (req, res) => {
  if (req.session && req.session.userId && req.session.user)
    return res.json({ loggedIn: true, user: req.session.user });
  res.json({ loggedIn: false, user: null });
});

// POST /auth/logout
app.post('/auth/logout', (req, res) => {
  req.session.userId = null;
  req.session.user   = null;
  res.json({ success: true });
});

// ============================================================
// PRODUCTS CRUD
// ============================================================

// Helper: convert a DB row (snake_case, JSON strings) → clean JS object
function rowToProduct(row) {
  return {
    id:             row.id,
    name:           row.name,
    category:       row.category,
    sku:            row.sku,
    price:          Number(row.price),
    discount_price: row.discount_price != null ? Number(row.discount_price) : null,
    stock:          Number(row.stock),
    unit:           row.unit,
    origin:         row.origin,
    description:    row.description,
    details:        row.details,
    tags:           typeof row.tags   === 'string' ? JSON.parse(row.tags)   : (row.tags   || []),
    featured:       !!row.featured,
    new_arrival:    !!row.new_arrival,
    best_seller:    !!row.best_seller,
    active:         !!row.active,
    images:         typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
    icon:           row.icon,
    createdAt:      row.created_at,
  };
}

// GET /api/products.php  — list all or single by ?id=
app.get('/api/products.php', async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.json(rowToProduct(rows[0]));
    }
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows.map(rowToProduct));
  } catch (err) {
    console.error('GET products error:', err.message);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// POST /api/products.php  — create product (admin only)
app.post('/api/products.php', requireAdminAuth, async (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined || price === '')
    return res.status(400).json({ error: 'Name and price are required' });

  const id = 'p' + uuidv4().replace(/-/g, '').slice(0, 14);
  const body = req.body;
  const tags   = Array.isArray(body.tags)   ? body.tags   : (body.tags   ? [body.tags]   : []);
  const images = Array.isArray(body.images) ? body.images : (body.images ? [body.images] : []);

  try {
    await db.query(
      `INSERT INTO products
         (id, name, category, sku, price, discount_price, stock, unit, origin,
          description, details, tags, featured, new_arrival, best_seller, active, images, icon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        String(name).trim(),
        body.category      || '',
        body.sku           || '',
        Number(price),
        body.discount_price ? Number(body.discount_price) : null,
        body.stock !== undefined ? Number(body.stock) : 0,
        body.unit          || '',
        body.origin        || '',
        body.description   || '',
        body.details       || '',
        JSON.stringify(tags),
        body.featured   === true || body.featured   === 'true' ? 1 : 0,
        body.new_arrival === true || body.new_arrival === 'true' ? 1 : 0,
        body.best_seller === true || body.best_seller === 'true' ? 1 : 0,
        body.active !== false && body.active !== 'false' ? 1 : 0,
        JSON.stringify(images),
        body.icon || 'leafBottle',
      ]
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('POST products error:', err.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products.php?id=  — update product (admin only)
app.put('/api/products.php', requireAdminAuth, async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });

  const body = req.body;
  const fields = [];
  const values = [];

  const strFields = ['name', 'category', 'sku', 'unit', 'origin', 'description', 'details', 'icon'];
  strFields.forEach(f => {
    if (body[f] !== undefined) { fields.push(`${f} = ?`); values.push(body[f]); }
  });
  if (body.price          !== undefined) { fields.push('price = ?');          values.push(Number(body.price)); }
  if (body.stock          !== undefined) { fields.push('stock = ?');          values.push(Number(body.stock)); }
  if (body.discount_price !== undefined) { fields.push('discount_price = ?'); values.push(body.discount_price ? Number(body.discount_price) : null); }
  if (body.featured       !== undefined) { fields.push('featured = ?');       values.push(body.featured   === true || body.featured   === 'true' ? 1 : 0); }
  if (body.new_arrival    !== undefined) { fields.push('new_arrival = ?');    values.push(body.new_arrival === true || body.new_arrival === 'true' ? 1 : 0); }
  if (body.best_seller    !== undefined) { fields.push('best_seller = ?');    values.push(body.best_seller === true || body.best_seller === 'true' ? 1 : 0); }
  if (body.active         !== undefined) { fields.push('active = ?');         values.push(body.active === true || body.active === 'true' || body.active === 1 ? 1 : 0); }
  if (body.tags           !== undefined) { fields.push('tags = ?');           values.push(JSON.stringify(Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : []))); }
  if (body.images         !== undefined) { fields.push('images = ?');         values.push(JSON.stringify(Array.isArray(body.images) ? body.images : (body.images ? [body.images] : []))); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(id);

  try {
    const [result] = await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('PUT products error:', err.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products.php?id=  — delete product (admin only)
app.delete('/api/products.php', requireAdminAuth, async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE products error:', err.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// POST /api/upload.php — image upload (admin only)
app.post('/api/upload.php', requireAdminAuth, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: 'No files uploaded' });
  const filePaths = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ success: true, filePaths });
});

// ============================================================
// ANALYTICS
// ============================================================
function safeHostname(url) {
  if (!url) return 'direct';
  try { return new URL(url).hostname || 'direct'; }
  catch { return 'direct'; }
}

// POST /api/analytics/event — public (browser tracker fires this)
app.post('/api/analytics/event', async (req, res) => {
  try {
    const { type, url, referrer, device, target, label } = req.body;
    if (!type || !url) return res.status(400).json({ ok: false });

    if (type === 'pageview') {
      await db.query(
        'INSERT INTO pageviews (url, referrer, device) VALUES (?, ?, ?)',
        [url.slice(0, 500), (referrer || '').slice(0, 500), device || 'desktop']
      );
    } else if (type === 'click') {
      await db.query(
        'INSERT INTO events (target, label, url) VALUES (?, ?, ?)',
        [(target || '').slice(0, 100), (label || '').slice(0, 120), url.slice(0, 500)]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Analytics event error:', err.message);
    res.status(500).json({ ok: false });
  }
});

// GET /api/analytics/stats — admin only, aggregated stats
app.get('/api/analytics/stats', requireAdminAuth, async (req, res) => {
  try {
    const days    = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const cutoff  = new Date(Date.now() - days * 86400000);
    const cutoffStr = cutoff.toISOString().slice(0, 19).replace('T', ' ');
    const todayStr  = new Date().toISOString().slice(0, 10);

    // Total views in period
    const [[{ totalViews }]] = await db.query(
      'SELECT COUNT(*) AS totalViews FROM pageviews WHERE ts >= ?', [cutoffStr]
    );
    // Total events in period
    const [[{ totalEvents }]] = await db.query(
      'SELECT COUNT(*) AS totalEvents FROM events WHERE ts >= ?', [cutoffStr]
    );
    // Today's views
    const [[{ todayViews }]] = await db.query(
      "SELECT COUNT(*) AS todayViews FROM pageviews WHERE DATE(ts) = CURDATE()"
    );
    // All-time views
    const [[{ allTimeViews }]] = await db.query(
      'SELECT COUNT(*) AS allTimeViews FROM pageviews'
    );

    // Views per day (last N days)
    const [dayRows] = await db.query(
      `SELECT DATE(ts) AS day, COUNT(*) AS views
       FROM pageviews
       WHERE ts >= ?
       GROUP BY DATE(ts)
       ORDER BY day ASC`,
      [cutoffStr]
    );
    const viewsByDay = {};
    dayRows.forEach(r => { viewsByDay[r.day.toISOString().slice(0, 10)] = Number(r.views); });
    const viewsTimeline = [];
    for (let i = days - 1; i >= 0; i--) {
      const d     = new Date(Date.now() - i * 86400000);
      const dStr  = d.toISOString().slice(0, 10);
      const label = new Date(dStr + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      viewsTimeline.push({ date: dStr, label, views: viewsByDay[dStr] || 0 });
    }

    // Top pages
    const [pageRows] = await db.query(
      `SELECT SUBSTRING_INDEX(url, '?', 1) AS page, COUNT(*) AS count
       FROM pageviews WHERE ts >= ?
       GROUP BY page ORDER BY count DESC LIMIT 10`,
      [cutoffStr]
    );
    const topPages = pageRows.map(r => ({ page: r.page, count: Number(r.count) }));

    // Device breakdown
    const [devRows] = await db.query(
      `SELECT device, COUNT(*) AS count
       FROM pageviews WHERE ts >= ?
       GROUP BY device`,
      [cutoffStr]
    );
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    devRows.forEach(r => { devices[r.device] = Number(r.count); });

    // Top click events
    const [clickRows] = await db.query(
      `SELECT CONCAT(target, IF(label != '', CONCAT(' · ', label), '')) AS action, COUNT(*) AS count
       FROM events WHERE ts >= ?
       GROUP BY action ORDER BY count DESC LIMIT 10`,
      [cutoffStr]
    );
    const topClicks = clickRows.map(r => ({ action: r.action, count: Number(r.count) }));

    // Top referrers
    const [refRows] = await db.query(
      `SELECT referrer, COUNT(*) AS count
       FROM pageviews WHERE ts >= ? AND referrer != ''
       GROUP BY referrer ORDER BY count DESC LIMIT 50`,
      [cutoffStr]
    );
    const refMap = {};
    refRows.forEach(r => {
      const src = safeHostname(r.referrer);
      refMap[src] = (refMap[src] || 0) + Number(r.count);
    });
    const topReferrers = Object.entries(refMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }));

    res.json({ totalViews, totalEvents, todayViews, allTimeViews, viewsTimeline, topPages, devices, topClicks, topReferrers });
  } catch (err) {
    console.error('Analytics stats error:', err.message);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// ============================================================
// STATIC FILES (must be last so API routes always win)
// ============================================================
app.use(express.static(__dirname, { index: 'index.html' }));

// ============================================================
// START
// ============================================================
(async () => {
  try {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Buy Alchimia running on http://0.0.0.0:${PORT}`);
      if (!process.env.GOOGLE_CLIENT_ID)
        console.warn('⚠️  Warning: GOOGLE_CLIENT_ID not set — Google Sign-In unavailable.');
      if (!process.env.DB_PASSWORD)
        console.warn('⚠️  Warning: DB_PASSWORD not set — using empty password.');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();
