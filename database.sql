-- ============================================================
--  Buy Alchimia — MySQL Database Schema
--  Run this ONCE to create the database and all tables.
--
--  Usage in aaPanel phpMyAdmin:
--    1. Open phpMyAdmin → SQL tab
--    2. Paste this entire file and click "Go"
--
--  Or via SSH:
--    mysql -u root -p < database.sql
-- ============================================================

-- Step 1: Create the database (skip if already exists)
CREATE DATABASE IF NOT EXISTS alchimia
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE alchimia;

-- ============================================================
-- TABLE: products
-- Stores all shop products managed via the Admin Panel
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id             VARCHAR(64)    NOT NULL PRIMARY KEY  COMMENT 'Unique product ID (e.g. p1a2b3c4d5e6f7)',
  name           VARCHAR(255)   NOT NULL              COMMENT 'Product display name',
  category       VARCHAR(100)   DEFAULT ''            COMMENT 'e.g. Spices, Tea, Coffee',
  sku            VARCHAR(100)   DEFAULT ''            COMMENT 'Stock keeping unit code',
  price          DECIMAL(10,2)  NOT NULL DEFAULT 0    COMMENT 'Selling price in USD',
  discount_price DECIMAL(10,2)  DEFAULT NULL          COMMENT 'Original price before discount (shown as strikethrough)',
  stock          INT            DEFAULT 0             COMMENT 'Available quantity',
  unit           VARCHAR(50)    DEFAULT ''            COMMENT 'e.g. 100g, 250ml',
  origin         VARCHAR(100)   DEFAULT ''            COMMENT 'Country/region of origin',
  description    TEXT           DEFAULT ''            COMMENT 'Short product description',
  details        TEXT           DEFAULT ''            COMMENT 'Long product details / ingredients',
  tags           JSON           DEFAULT (JSON_ARRAY()) COMMENT 'Array of tag strings e.g. ["organic","bestseller"]',
  featured       TINYINT(1)     DEFAULT 0             COMMENT '1 = show on homepage featured section',
  new_arrival    TINYINT(1)     DEFAULT 0             COMMENT '1 = show in New Arrivals section',
  best_seller    TINYINT(1)     DEFAULT 0             COMMENT '1 = show in Best Sellers section',
  active         TINYINT(1)     DEFAULT 1             COMMENT '1 = visible on storefront, 0 = hidden',
  images         JSON           DEFAULT (JSON_ARRAY()) COMMENT 'Array of image paths e.g. ["/uploads/abc.jpg"]',
  icon           VARCHAR(100)   DEFAULT 'leafBottle'  COMMENT 'Icon key used in JS icon library',
  created_at     DATETIME       DEFAULT CURRENT_TIMESTAMP COMMENT 'When product was added'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Shop products';

-- ============================================================
-- TABLE: users
-- Stores registered customer accounts (email + Google OAuth)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          VARCHAR(64)   NOT NULL PRIMARY KEY  COMMENT 'UUID',
  first_name  VARCHAR(100)  DEFAULT ''            COMMENT 'First name',
  last_name   VARCHAR(100)  DEFAULT ''            COMMENT 'Last name',
  name        VARCHAR(200)  NOT NULL              COMMENT 'Full display name',
  email       VARCHAR(255)  NOT NULL UNIQUE       COMMENT 'Login email (lowercase)',
  password    VARCHAR(255)  DEFAULT NULL          COMMENT 'bcrypt hash — NULL for Google-only accounts',
  picture     TEXT          DEFAULT NULL          COMMENT 'Profile picture URL (Google accounts)',
  provider    VARCHAR(20)   DEFAULT 'email'       COMMENT '"email" or "google"',
  google_id   VARCHAR(100)  DEFAULT NULL          COMMENT 'Google sub ID for OAuth accounts',
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation date'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Customer accounts';

-- ============================================================
-- TABLE: pageviews
-- Records every page visit sent by tracker.js
-- ============================================================
CREATE TABLE IF NOT EXISTS pageviews (
  id       BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  url      VARCHAR(500) NOT NULL              COMMENT 'Page path e.g. /products.html',
  referrer VARCHAR(500) DEFAULT ''            COMMENT 'Referring URL (empty = direct)',
  device   VARCHAR(20)  DEFAULT 'desktop'    COMMENT '"desktop", "mobile", or "tablet"',
  ts       DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of visit',
  INDEX idx_ts    (ts),
  INDEX idx_url   (url(100)),
  INDEX idx_device (device)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Page view analytics';

-- ============================================================
-- TABLE: events
-- Records user click events sent by tracker.js
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id     BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  target VARCHAR(100) DEFAULT ''   COMMENT 'Event type e.g. "add_to_cart", "hero_cta_shop"',
  label  VARCHAR(255) DEFAULT ''   COMMENT 'Optional label e.g. product name',
  url    VARCHAR(500) NOT NULL     COMMENT 'Page where event occurred',
  ts     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of event',
  INDEX idx_ts     (ts),
  INDEX idx_target (target)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Click event analytics';

-- ============================================================
-- SAMPLE DATA (optional — delete if you don't need demo products)
-- ============================================================
INSERT IGNORE INTO products
  (id, name, category, sku, price, discount_price, stock, unit, origin, description, featured, active, images)
VALUES
  ('p_demo_cinnamon', 'Ceylon Cinnamon',   'Spices',     '001', 10.00, 14.00, 1000, '100g', 'Sri Lanka', 'Premium true cinnamon from Sri Lanka.', 1, 1, JSON_ARRAY()),
  ('p_demo_tea',      'Ceylon Black Tea',  'Tea',        '002', 12.00, 14.00,  300, '100g', 'Sri Lanka', 'Rich, full-bodied black tea.',          0, 1, JSON_ARRAY()),
  ('p_demo_coffee',   'Ceylon Coffee',     'Coffee',     '003', 10.00, 14.00,  478, '100g', 'Sri Lanka', 'Single-origin black coffee.',           0, 1, JSON_ARRAY()),
  ('p_demo_chilli',   'Cobra Chilli',      'Spices',     '004',  7.00,  9.00,  432, '100g', 'Sri Lanka', 'Fiery cobra chilli.',                   0, 1, JSON_ARRAY()),
  ('p_demo_ghee',     'Organic Ghee',      'Essential Oils', '005', 30.00, 50.00, 543, '250ml', 'Kandy', 'Pure organic ghee from Kandy.',        1, 1, JSON_ARRAY()),
  ('p_demo_pepper',   'Black Pepper',      'Spices',     '006', 20.00, 31.00,  675, '250g', 'Sri Lanka', 'Bold, aromatic black pepper.',          0, 1, JSON_ARRAY()),
  ('p_demo_moringa',  'Moringa Tea',       'Herbal Tea', '007', 14.00, 16.00,  789, '100g', 'Sri Lanka', 'Nutritious moringa herbal tea.',        0, 1, JSON_ARRAY());

-- Done!
SELECT 'Database setup complete!' AS status;
