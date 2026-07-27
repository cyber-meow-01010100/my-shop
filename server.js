const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = 5000;

// ---- Paths ----
const DATA_DIR       = path.join(__dirname, 'data');
const PRODUCTS_FILE  = path.join(DATA_DIR, 'products.json');
const USERS_FILE     = path.join(DATA_DIR, 'users.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const UPLOADS_DIR    = path.join(__dirname, 'uploads');

// Ensure directories/files exist
if (!fs.existsSync(DATA_DIR))    fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(PRODUCTS_FILE))  fs.writeFileSync(PRODUCTS_FILE, '[]');
if (!fs.existsSync(USERS_FILE))     fs.writeFileSync(USERS_FILE, '[]');
if (!fs.existsSync(ANALYTICS_FILE)) fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({ pageviews: [], events: [] }));

// ---- JSON store helpers ----
function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return []; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Shorthand aliases
const readProducts  = () => readJSON(PRODUCTS_FILE);
const writeProducts = (d) => writeJSON(PRODUCTS_FILE, d);
const readUsers     = () => readJSON(USERS_FILE);
const writeUsers    = (d) => writeJSON(USERS_FILE, d);

function readAnalytics() {
  try {
    const raw = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
    return {
      pageviews: Array.isArray(raw.pageviews) ? raw.pageviews : [],
      events:    Array.isArray(raw.events)    ? raw.events    : [],
    };
  } catch { return { pageviews: [], events: [] }; }
}
function writeAnalytics(d) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(d));
}

// In-memory write queue to avoid concurrent file writes under rapid traffic
let analyticsWriteTimer = null;
let analyticsPending    = null;

function queueAnalyticsWrite(data) {
  analyticsPending = data;
  if (!analyticsWriteTimer) {
    analyticsWriteTimer = setTimeout(() => {
      if (analyticsPending) writeAnalytics(analyticsPending);
      analyticsPending    = null;
      analyticsWriteTimer = null;
    }, 200);
  }
}

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'alchimia-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));
app.use('/uploads', express.static(UPLOADS_DIR));

// ---- Multer: image uploads ----
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
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

// ---- Dynamic config (safely exposes GOOGLE_CLIENT_ID to frontend) ----
app.get('/js/config.js', (_req, res) => {
  res.type('application/javascript');
  res.send(`window.ALCHIMIA_CONFIG = ${JSON.stringify({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    CURRENCY: 'USD',
    CURRENCY_SYMBOL: '$'
  })};`);
});

// ============================================================
// ADMIN AUTH
// ============================================================
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'alchimia2026';

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

// Helper: strip password before sending user to client
function safeUser(u) {
  const { password, ...rest } = u;
  return rest;
}

// Helper: get a verified Google payload from an ID token
async function verifyGoogleToken(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
  return ticket.getPayload();
}

// POST /auth/register  — email + password
app.post('/auth/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const emailLc = email.toLowerCase().trim();
  const users = readUsers();

  const existing = users.find(u => u.email === emailLc);
  if (existing) {
    if (existing.provider === 'google') {
      return res.status(409).json({ error: 'This email is registered with Google Sign-In. Please use "Sign in with Google".' });
    }
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    name: `${firstName.trim()} ${lastName.trim()}`,
    email: emailLc,
    password: hash,
    picture: null,
    provider: 'email',
    createdAt: new Date().toISOString()
  };
  users.push(user);
  writeUsers(users);

  req.session.userId = user.id;
  req.session.user = safeUser(user);
  res.status(201).json({ success: true, user: safeUser(user) });
});

// POST /auth/login  — email + password
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const emailLc = email.toLowerCase().trim();
  const users = readUsers();
  const user = users.find(u => u.email === emailLc);

  if (!user) {
    return res.status(401).json({ error: 'No account found with that email.' });
  }
  if (user.provider === 'google') {
    return res.status(401).json({ error: 'This account uses Google Sign-In. Please click "Sign in with Google".' });
  }
  if (!user.password) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  req.session.userId = user.id;
  req.session.user = safeUser(user);
  res.json({ success: true, user: safeUser(user) });
});

// POST /auth/google  — verify Google ID token, create or retrieve user
app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No credential provided.' });

  let payload;
  try {
    payload = await verifyGoogleToken(credential);
  } catch (err) {
    console.error('Google token verification failed:', err.message);
    if (err.message.includes('not configured')) {
      return res.status(503).json({ error: 'Google Sign-In is not configured on this server. Please add your GOOGLE_CLIENT_ID.' });
    }
    return res.status(401).json({ error: 'Invalid Google credential. Please try again.' });
  }

  const emailLc = payload.email.toLowerCase();
  const users = readUsers();
  let user = users.find(u => u.email === emailLc);

  if (!user) {
    // First Google login — create account automatically
    user = {
      id: uuidv4(),
      firstName: payload.given_name || payload.name.split(' ')[0] || '',
      lastName: payload.family_name || payload.name.split(' ').slice(1).join(' ') || '',
      name: payload.name,
      email: emailLc,
      picture: payload.picture || null,
      provider: 'google',
      googleId: payload.sub,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    writeUsers(users);
  } else {
    // Refresh picture in case it changed
    if (payload.picture && user.picture !== payload.picture) {
      user.picture = payload.picture;
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) { users[idx] = user; writeUsers(users); }
    }
  }

  req.session.userId = user.id;
  req.session.user = user;
  res.json({ success: true, user });
});

// GET /auth/me  — return current session user
app.get('/auth/me', (req, res) => {
  if (req.session && req.session.userId && req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  res.json({ loggedIn: false, user: null });
});

// POST /auth/logout  — destroy user session
app.post('/auth/logout', (req, res) => {
  req.session.userId = null;
  req.session.user = null;
  res.json({ success: true });
});

// ============================================================
// PRODUCTS CRUD
// ============================================================

app.get('/api/products.php', (req, res) => {
  const products = readProducts();
  const { id } = req.query;
  if (id) {
    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    return res.json(product);
  }
  res.json(products);
});

app.post('/api/products.php', requireAdminAuth, (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined || price === '') {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  const products = readProducts();
  const newProduct = {
    id: 'p' + uuidv4().replace(/-/g, '').slice(0, 14),
    name: String(name).trim(),
    category: req.body.category || '',
    sku: req.body.sku || '',
    price: Number(price),
    discount_price: req.body.discount_price ? Number(req.body.discount_price) : null,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : 0,
    unit: req.body.unit || '',
    origin: req.body.origin || '',
    description: req.body.description || '',
    details: req.body.details || '',
    tags: Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? [req.body.tags] : []),
    featured: req.body.featured === true || req.body.featured === 'true',
    new_arrival: req.body.new_arrival === true || req.body.new_arrival === 'true',
    best_seller: req.body.best_seller === true || req.body.best_seller === 'true',
    active: req.body.active !== false && req.body.active !== 'false',
    images: Array.isArray(req.body.images) ? req.body.images : (req.body.images ? [req.body.images] : []),
    icon: req.body.icon || 'leafBottle',
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  writeProducts(products);
  res.status(201).json({ success: true, id: newProduct.id });
});

app.put('/api/products.php', requireAdminAuth, (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });
  const products = readProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const p = products[idx];
  const body = req.body;
  const stringFields = ['name', 'category', 'sku', 'unit', 'origin', 'description', 'details', 'icon'];
  stringFields.forEach(f => { if (body[f] !== undefined) p[f] = body[f]; });
  if (body.price !== undefined) p.price = Number(body.price);
  if (body.stock !== undefined) p.stock = Number(body.stock);
  if (body.discount_price !== undefined) p.discount_price = body.discount_price ? Number(body.discount_price) : null;
  if (body.featured !== undefined) p.featured = body.featured === true || body.featured === 'true';
  if (body.new_arrival !== undefined) p.new_arrival = body.new_arrival === true || body.new_arrival === 'true';
  if (body.best_seller !== undefined) p.best_seller = body.best_seller === true || body.best_seller === 'true';
  if (body.active !== undefined) p.active = body.active === true || body.active === 'true' || body.active === 1;
  if (body.tags !== undefined) p.tags = Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : []);
  if (body.images !== undefined) p.images = Array.isArray(body.images) ? body.images : (body.images ? [body.images] : []);
  products[idx] = p;
  writeProducts(products);
  res.json({ success: true });
});

app.delete('/api/products.php', requireAdminAuth, (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });
  const products = readProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return res.status(404).json({ error: 'Not found' });
  writeProducts(filtered);
  res.json({ success: true });
});

// ---- Image upload ----
app.post('/api/upload.php', requireAdminAuth, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const filePaths = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ success: true, filePaths });
});

// ============================================================
// ANALYTICS
// ============================================================

// Safely parse a hostname from a URL string
function safeHostname(url) {
  if (!url) return 'direct';
  try { return new URL(url).hostname || 'direct'; }
  catch { return 'direct'; }
}

// POST /api/analytics/event — public, receives pageviews and clicks
app.post('/api/analytics/event', (req, res) => {
  try {
    const { type, url, referrer, device, target, label } = req.body;
    if (!type || !url) return res.status(400).json({ ok: false });

    const data = readAnalytics();
    const ts   = new Date().toISOString();

    if (type === 'pageview') {
      data.pageviews.push({ url, referrer: referrer || '', device: device || 'desktop', ts });
      if (data.pageviews.length > 50000) data.pageviews = data.pageviews.slice(-50000);
    } else if (type === 'click') {
      data.events.push({ target: target || '', label: (label || '').slice(0, 120), url, ts });
      if (data.events.length > 50000) data.events = data.events.slice(-50000);
    }

    queueAnalyticsWrite(data);
    res.json({ ok: true });
  } catch (err) {
    console.error('Analytics event error:', err.message);
    res.status(500).json({ ok: false });
  }
});

// GET /api/analytics/stats — admin only, returns aggregated traffic data
app.get('/api/analytics/stats', requireAdminAuth, (req, res) => {
  try {
    const days   = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const data   = readAnalytics();
    const cutoff = new Date(Date.now() - days * 86400000);
    const todayStr = new Date().toISOString().slice(0, 10);

    const recentViews  = data.pageviews.filter(v => new Date(v.ts) >= cutoff);
    const recentEvents = data.events.filter(e => new Date(e.ts) >= cutoff);

    // --- Page views over time (per day) ---
    const viewsByDay = {};
    recentViews.forEach(v => {
      const day = v.ts.slice(0, 10);
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });
    const dayLabels = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      dayLabels.push(d.toISOString().slice(0, 10));
    }
    const viewsTimeline = dayLabels.map(d => ({
      date:  d,
      label: new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: viewsByDay[d] || 0,
    }));

    // --- Top pages ---
    const pageCounts = {};
    recentViews.forEach(v => {
      const page = v.url.split('?')[0];
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // --- Device breakdown ---
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    recentViews.forEach(v => { devices[v.device || 'desktop'] = (devices[v.device || 'desktop'] || 0) + 1; });

    // --- Top click events ---
    const clickMap = {};
    recentEvents.forEach(e => {
      const key = e.target + (e.label ? ' · ' + e.label : '');
      clickMap[key] = (clickMap[key] || 0) + 1;
    });
    const topClicks = Object.entries(clickMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));

    // --- Top referrers ---
    const refMap = {};
    recentViews.forEach(v => {
      const source = safeHostname(v.referrer) || 'direct';
      refMap[source] = (refMap[source] || 0) + 1;
    });
    const topReferrers = Object.entries(refMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }));

    // --- Summary numbers ---
    const todayViews = data.pageviews.filter(v => v.ts.slice(0, 10) === todayStr).length;

    res.json({
      totalViews:    recentViews.length,
      totalEvents:   recentEvents.length,
      todayViews,
      allTimeViews:  data.pageviews.length,
      viewsTimeline,
      topPages,
      devices,
      topClicks,
      topReferrers,
    });
  } catch (err) {
    console.error('Analytics stats error:', err.message);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// ---- Static files (after all routes so API always wins) ----
app.use(express.static(__dirname, { index: 'index.html' }));

// ---- Start ----
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Buy Alchimia running on http://0.0.0.0:${PORT}`);
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn('Warning: GOOGLE_CLIENT_ID is not set — Google Sign-In will be unavailable.');
  }
});
