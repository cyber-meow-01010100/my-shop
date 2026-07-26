const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

// ---- Paths ----
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, '[]');

// ---- JSON store helpers ----
function readProducts() {
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'alchimia-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours
}));

// Serve uploaded images (registered before API routes so /uploads/* never hits the router)
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(file.mimetype));
  }
});

// ---- Auth ----
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'alchimia2026';

function requireAuth(req, res, next) {
  if (req.session && req.session.adminLoggedIn) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// POST /api/login.php
app.post('/api/login.php', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.adminLoggedIn = true;
    req.session.username = username;
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// POST /api/logout.php
app.post('/api/logout.php', (req, res) => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

// GET /api/me.php
app.get('/api/me.php', (req, res) => {
  res.json({
    loggedIn: !!(req.session && req.session.adminLoggedIn),
    username: (req.session && req.session.username) || null
  });
});

// ---- Products CRUD ----

// GET /api/products.php  or  GET /api/products.php?id=<id>
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

// POST /api/products.php
app.post('/api/products.php', requireAuth, (req, res) => {
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

// PUT /api/products.php?id=<id>
app.put('/api/products.php', requireAuth, (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });

  const products = readProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const p = products[idx];
  const body = req.body;

  // Apply all updatable fields
  const stringFields = ['name', 'category', 'sku', 'unit', 'origin', 'description', 'details', 'icon'];
  stringFields.forEach(f => { if (body[f] !== undefined) p[f] = body[f]; });

  if (body.price !== undefined) p.price = Number(body.price);
  if (body.stock !== undefined) p.stock = Number(body.stock);
  if (body.discount_price !== undefined) {
    p.discount_price = body.discount_price ? Number(body.discount_price) : null;
  }
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

// DELETE /api/products.php?id=<id>
app.delete('/api/products.php', requireAuth, (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });

  const products = readProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return res.status(404).json({ error: 'Not found' });

  writeProducts(filtered);
  res.json({ success: true });
});

// ---- Image upload ----
// POST /api/upload.php  (field name: "images")
app.post('/api/upload.php', requireAuth, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const filePaths = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ success: true, filePaths });
});

// ---- Static files (registered AFTER API routes so /api/*.php routes are handled first) ----
app.use(express.static(__dirname, { index: 'index.html' }));

// ---- Start ----
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Buy Alchimia running on http://0.0.0.0:${PORT}`);
});
