# Buy Alchimia — World-Class Organic eCommerce

> Premium organic spices, tea, coffee and honey from Sri Lanka — sourced directly from small farms, shipped worldwide.

## 🚀 Quick Start

This is a **pure static website** — no build tools, no server required. Simply open `index.html` in a browser.

### Option 1: Open directly
```
Double-click index.html
```

### Option 2: Local server (recommended for full functionality)
```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code: Use "Live Server" extension
```

Then visit: **http://localhost:8080**

---

## 🛍️ Admin Panel

Access the admin dashboard at:

```
http://localhost:8080/admin/
```
or open `admin/index.html` directly.

**Default Credentials:**
| Field    | Value         |
|----------|---------------|
| Username | `admin`       |
| Password | `alchimia2026`|

> ⚠️ Change these credentials in `admin/js/admin-auth.js` before going live.

### Admin Features

| Section       | Description |
|---------------|-------------|
| 📊 Dashboard  | Revenue stats, recent orders, top products, sales chart |
| 📈 Analytics  | 30-day revenue chart, order breakdown, top products |
| 📦 Products   | Add/edit/delete products, manage stock, SKU, pricing |
| 🏷️ Categories | Manage product categories |
| 🛒 Orders     | View orders, update status, print invoices, export CSV |
| 👥 Customers  | Customer list, profiles, order history |
| ⭐ Reviews    | Moderate customer reviews, approve/delete |
| 🎟️ Coupons   | Create discount codes (% or fixed amount) |
| 📧 Newsletter | Subscriber management, CSV export |
| ✍️ Blog       | Create and manage blog posts |
| 🖼️ Media      | Upload and manage images |
| ⚙️ Settings   | Store settings, SEO, payments, social links |

---

## 📁 Project Structure

```
alchimabuy/
├── index.html              # Homepage
├── products.html           # Shop / product listing
├── product.html            # Individual product detail
├── cart.html               # Shopping cart
├── checkout.html           # Checkout form
├── login.html              # Customer login / register
├── order-confirmation.html # Order success page
│
├── css/
│   └── style.css           # Main design system (1000+ lines)
│
├── js/
│   ├── config.js           # API keys & configuration
│   ├── db.js               # 🆕 Frontend data store (localStorage)
│   ├── reviews.js          # 🆕 Customer reviews module
│   ├── cart.js             # Cart management
│   ├── auth.js             # Customer authentication
│   ├── main.js             # Homepage logic
│   ├── products-data.js    # Fallback product catalog (15 products)
│   ├── animations.js       # Scroll animations
│   ├── icons.js            # SVG icon library
│   ├── quickview.js        # Quick view modal
│   └── wishlist.js         # Wishlist management
│
├── admin/
│   ├── index.html          # Admin login
│   ├── dashboard.html      # Main dashboard
│   ├── products.html       # Product management
│   ├── orders.html         # Order management
│   ├── customers.html      # Customer management
│   ├── categories.html     # Category management
│   ├── coupons.html        # Coupon management
│   ├── reviews.html        # Review moderation
│   ├── newsletter.html     # Newsletter subscribers
│   ├── analytics.html      # Analytics & charts
│   ├── blog.html           # Blog management
│   ├── media.html          # Media library
│   ├── settings.html       # Site settings
│   │
│   ├── css/
│   │   └── admin.css       # Admin design system (dark theme)
│   │
│   └── js/
│       ├── admin-auth.js   # Admin session management
│       ├── admin-layout.js # Sidebar & topbar component
│       └── admin-db.js     # (optional extended admin operations)
│
└── images/                 # Product images (add yours here)
```

---

## 🔧 Configuration

Edit `js/config.js` to add your API keys:

```javascript
window.ALCHIMIA_CONFIG = {
  GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  STRIPE_PUBLISHABLE_KEY: "pk_live_...",
  PAYPAL_CLIENT_ID: "YOUR_PAYPAL_CLIENT_ID",
  API_BASE_URL: "https://your-api.com/api",  // Backend URL
  CURRENCY: "USD",
  CURRENCY_SYMBOL: "$"
};
```

---

## 💾 Data Storage

This website uses **localStorage** as its database — no server required.

| Store Key              | Contents |
|------------------------|----------|
| `alchimia_products`    | Product catalog |
| `alchimia_orders`      | All orders |
| `alchimia_customers`   | Customer profiles |
| `alchimia_reviews`     | Product reviews |
| `alchimia_coupons`     | Discount codes |
| `alchimia_newsletter`  | Email subscribers |
| `alchimia_categories`  | Product categories |
| `alchimia_settings`    | Site configuration |
| `alchimia_blog`        | Blog posts |
| `alchimia_cart`        | Current cart |
| `alchimia_wishlist`    | Wishlist items |
| `alchimia_user`        | Logged-in customer |
| `alchimia_admin_session` | Admin session |

> All admin changes (product edits, order status updates, etc.) persist in localStorage and are immediately reflected on the storefront.

---

## 🔐 Security Notes

Since this is a client-side only site:
- Admin credentials are validated in JavaScript (suitable for demo/prototype)
- For production, connect to a real backend via `API_BASE_URL` in `config.js`
- The existing `auth.js` already handles backend authentication when `API_BASE_URL` is set
- Do NOT expose admin credentials publicly in production

---

## 🌍 Connecting a Backend

The codebase is designed to work with OR without a backend:

1. Set `API_BASE_URL` in `js/config.js`
2. The `fetchProducts()` function in `cart.js` will try the API first, fall back to `db.js`
3. The `auth.js` already posts to `/auth/google` when a backend is available
4. For orders, connect the checkout form to POST to `/orders`

**Recommended backend:** Node.js + Express + SQLite (a complete `server/` folder can be provided separately)

---

## 📦 Default Products

The site ships with **15 real organic products** from Sri Lanka:

| Product | Category | Price |
|---------|----------|-------|
| Ceylon Cinnamon Quills | Spices | $14.00 |
| Ceylon Cinnamon Leaves | Spices | $8.50 |
| Wild Black Pepper | Spices | $11.00 |
| Green Cardamom Pods | Spices | $18.00 |
| Bourbon Vanilla Pods | Spices | $24.00 |
| Single-Origin Ceylon Coffee | Coffee | $19.50 |
| Ceylon Orthodox Black Tea | Tea | $13.00 |
| Ranawara Herbal Tea | Herbal Tea | $9.50 |
| Butterfly Pea Flower Tea | Herbal Tea | $10.00 |
| Dried Lotus Flowers | Herbal Tea | $12.50 |
| Golden Turmeric Root Powder | Spices | $9.00 |
| Fresh Dried Ginger Root | Spices | $8.00 |
| Wild Forest Honey | Honey | $22.00 |
| Herbal Immunity Capsules | Wellness | $28.00 |
| Ceylon Cinnamon Essential Oil | Essential Oils | $16.50 |

---

## 🎟️ Default Coupon Codes

| Code | Discount | Min Order |
|------|----------|-----------|
| `WELCOME10` | 10% off | No minimum |
| `ORGANIC15` | 15% off | $50+ |
| `FREESHIP` | $9 off (free shipping) | $75+ |

---

## 🚢 Shipping

Default configuration:
- **Free shipping** on orders over $75
- **Standard shipping:** $9.00
- Estimated delivery: 6–12 business days

---

## 💳 Accepted Payments

- Visa / Mastercard (via Stripe)
- PayPal
- All major debit cards

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| Vanilla CSS (custom) | Styling & animations |
| Vanilla JavaScript | All interactivity |
| Google Fonts (Fraunces, Inter, IBM Plex Mono) | Typography |
| Chart.js (admin CDN) | Admin analytics charts |
| LocalStorage | Data persistence |
| OpenStreetMap | Map embed |

---

## 🎨 Design System

**Colors:**
- Forest Green: `#2E7D32` (primary)
- Forest Dark: `#1B5E20`
- Sage: `#81C784`
- Gold: `#D4A373` (accent)
- Parchment: `#F8F9F5` (background)

**Fonts:**
- Display: Fraunces (serif)
- Body: Inter (sans-serif)
- Mono: IBM Plex Mono

---

## 📊 Admin Dashboard Stats (Demo Data)

The admin comes pre-loaded with:
- **4 demo orders** in various statuses
- **4 demo customers** from different countries
- **4 demo reviews** (3 approved, 1 pending)
- **3 newsletter subscribers**
- **3 default coupon codes**
- **3 blog posts**

---

## 🤝 Support

- Email: hello@buyalchimia.com
- WhatsApp: +94 71 234 5678
- Instagram: @buyalchimia

---

## 📄 License

All rights reserved © 2026 Buy Alchimia. Designed and built for Buy Alchimia.
