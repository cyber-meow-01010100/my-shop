# Buy Alchimia

Premium organic spices, tea, coffee and honey eCommerce site — sourced from Sri Lanka, shipped worldwide.

## Stack

- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Backend**: PHP 8.2 (built-in server)
- **Database**: SQLite (`database.sqlite`, auto-created on first run)
- **Charts**: Chart.js (CDN, admin only)
- **Fonts**: Google Fonts (Fraunces, Inter, IBM Plex Mono)

## How to run

The workflow `Start application` runs `php -S 0.0.0.0:5000` from the project root. The PHP built-in server handles both static files and the API endpoints under `/api/`.

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
