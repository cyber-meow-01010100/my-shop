# Buy Alchimia

Premium organic spices, tea, coffee and honey eCommerce site — sourced from Sri Lanka, shipped worldwide.

## Stack

- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Backend**: Node.js + Express (`server.js`)
- **Storage**: JSON file (`data/products.json`)
- **Charts**: Chart.js (CDN, admin only)
- **Fonts**: Google Fonts (Fraunces, Inter, IBM Plex Mono)

## How to run

The workflow `Start application` runs `node server.js`. Express serves static files and handles all API routes on port 5000.

The legacy PHP files in `/api/` are no longer used — all API logic lives in `server.js`.

## Key URLs

| Page | Path |
|------|------|
| Homepage | `/` |
| Shop | `/products.html` |
| Cart | `/cart.html` |
| Checkout | `/checkout.html` |
| Admin dashboard | `/admin/` |

## Admin credentials

- **Username**: `admin`
- **Password**: `alchimia2026` (hardcoded in `admin/js/admin-auth.js` — change before going live)

> Note: `db.php` also seeds an admin with a different hardcoded password (`@#$2003`) via bcrypt. Align these before deploying.

## API

All API endpoints live in `/api/` and are PHP scripts backed by SQLite:

- `products.php` — product CRUD
- `login.php` / `logout.php` / `me.php` — admin auth
- `upload.php` — media uploads

## Data persistence

- Product, order, customer, and other data is stored in `database.sqlite` (auto-created).
- No payment gateway is wired up — checkout collects order info only.

## User preferences

- Keep the existing project structure and stack (HTML/CSS/JS/PHP/SQLite).
