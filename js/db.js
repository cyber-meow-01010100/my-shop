/* ============================================================
   BUY ALCHIMIA — Frontend Database (localStorage)
   Central data layer: products, orders, customers, reviews,
   coupons, newsletter, categories, settings.
   ============================================================ */

const DB_VERSION = "1.3";
const DB_KEYS = {
  version:      "alchimia_db_version",
  products:     "alchimia_products",
  orders:       "alchimia_orders",
  customers:    "alchimia_customers",
  reviews:      "alchimia_reviews",
  coupons:      "alchimia_coupons",
  newsletter:   "alchimia_newsletter",
  categories:   "alchimia_categories",
  settings:     "alchimia_settings",
  media:        "alchimia_media",
  blog:         "alchimia_blog",
};

/* ---- Helpers ---- */
function dbGet(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; }
  catch(e) { return null; }
}
function dbSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch(e) { console.error("DB write error:", e); }
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function now() { return new Date().toISOString(); }

/* ============================================================
   DB.init — seeds data on first load
   ============================================================ */
const DB = {

  init() {
    const ver = localStorage.getItem(DB_KEYS.version);
    if (ver !== DB_VERSION) {
      DB._seed();
      localStorage.setItem(DB_KEYS.version, DB_VERSION);
    }
  },

  _seed() {
    // --- Products: handled by server database now ---

    // --- Categories ---
    if (!dbGet(DB_KEYS.categories)) {
      dbSet(DB_KEYS.categories, [
        { id: "cat-spices",     name: "Spices",        slug: "spices",       icon: "cinnamonQuills", blurb: "Cinnamon, pepper & more", active: true },
        { id: "cat-tea",        name: "Tea",            slug: "tea",          icon: "teaLeaf",        blurb: "Ceylon orthodox leaf tea", active: true },
        { id: "cat-herbal",     name: "Herbal Tea",     slug: "herbal-tea",   icon: "lotusFlower",    blurb: "Caffeine-free infusions", active: true },
        { id: "cat-coffee",     name: "Coffee",         slug: "coffee",       icon: "coffeeBean",     blurb: "Single-origin arabica", active: true },
        { id: "cat-honey",      name: "Honey",          slug: "honey",        icon: "honeyJar",       blurb: "Raw wildflower honey", active: true },
        { id: "cat-wellness",   name: "Wellness",       slug: "wellness",     icon: "herbalCapsule",  blurb: "Everyday supplements", active: true },
        { id: "cat-oils",       name: "Essential Oils", slug: "essential-oils", icon: "oilDropper",   blurb: "Steam-distilled purity", active: true },
      ]);
    }

    // --- Coupons ---
    if (!dbGet(DB_KEYS.coupons)) {
      dbSet(DB_KEYS.coupons, [
        { id: uid(), code: "WELCOME10", type: "percent", value: 10, minOrder: 0,   usageLimit: 1000, used: 0, active: true, expiresAt: "2027-12-31", createdAt: now() },
        { id: uid(), code: "ORGANIC15", type: "percent", value: 15, minOrder: 50,  usageLimit: 500,  used: 0, active: true, expiresAt: "2027-12-31", createdAt: now() },
        { id: uid(), code: "FREESHIP",  type: "fixed",   value: 9,  minOrder: 75,  usageLimit: 2000, used: 0, active: true, expiresAt: "2027-12-31", createdAt: now() },
      ]);
    }

    // --- Demo Orders ---
    if (!dbGet(DB_KEYS.orders)) {
      dbSet(DB_KEYS.orders, [
        {
          id: "ORD-001", status: "delivered",
          customer: { name: "Maria D.", email: "maria@example.com", country: "Canada" },
          items: [{ id: "p001", name: "Ceylon Cinnamon Quills", qty: 2, price: 14 }, { id: "p007", name: "Ceylon Orthodox Black Tea", qty: 1, price: 13 }],
          subtotal: 41, shipping: 0, discount: 0, total: 41,
          paymentMethod: "card", coupon: null,
          address: "123 Maple St, Toronto, ON M5A 1A1, Canada",
          createdAt: new Date(Date.now() - 8*24*3600*1000).toISOString(), updatedAt: now(),
          trackingNumber: "LK123456789CA"
        },
        {
          id: "ORD-002", status: "shipped",
          customer: { name: "Luca R.", email: "luca@example.com", country: "Italy" },
          items: [{ id: "p013", name: "Wild Forest Honey", qty: 1, price: 22 }, { id: "p006", name: "Single-Origin Ceylon Coffee", qty: 1, price: 19.5 }],
          subtotal: 41.5, shipping: 9, discount: 0, total: 50.5,
          paymentMethod: "paypal", coupon: null,
          address: "Via Roma 12, Milano, 20121, Italy",
          createdAt: new Date(Date.now() - 3*24*3600*1000).toISOString(), updatedAt: now(),
          trackingNumber: "LK987654321IT"
        },
        {
          id: "ORD-003", status: "processing",
          customer: { name: "Sarah K.", email: "sarah@example.com", country: "USA" },
          items: [{ id: "p009", name: "Butterfly Pea Flower Tea", qty: 2, price: 10 }, { id: "p011", name: "Golden Turmeric Root Powder", qty: 1, price: 9 }],
          subtotal: 29, shipping: 9, discount: 2.9, total: 35.1,
          paymentMethod: "card", coupon: "WELCOME10",
          address: "456 Oak Ave, Austin, TX 78701, USA",
          createdAt: new Date(Date.now() - 1*24*3600*1000).toISOString(), updatedAt: now(),
          trackingNumber: null
        },
        {
          id: "ORD-004", status: "pending",
          customer: { name: "James W.", email: "james@example.com", country: "Australia" },
          items: [{ id: "p005", name: "Bourbon Vanilla Pods", qty: 1, price: 24 }],
          subtotal: 24, shipping: 9, discount: 0, total: 33,
          paymentMethod: "card", coupon: null,
          address: "78 George St, Sydney, NSW 2000, Australia",
          createdAt: new Date(Date.now() - 2*3600*1000).toISOString(), updatedAt: now(),
          trackingNumber: null
        },
      ]);
    }

    // --- Demo Customers ---
    if (!dbGet(DB_KEYS.customers)) {
      dbSet(DB_KEYS.customers, [
        { id: uid(), name: "Maria D.",  email: "maria@example.com",  country: "Canada",    totalOrders: 1, totalSpent: 41,   createdAt: new Date(Date.now() - 30*24*3600*1000).toISOString() },
        { id: uid(), name: "Luca R.",   email: "luca@example.com",   country: "Italy",     totalOrders: 1, totalSpent: 50.5, createdAt: new Date(Date.now() - 10*24*3600*1000).toISOString() },
        { id: uid(), name: "Sarah K.",  email: "sarah@example.com",  country: "USA",       totalOrders: 1, totalSpent: 35.1, createdAt: new Date(Date.now() - 5*24*3600*1000).toISOString() },
        { id: uid(), name: "James W.",  email: "james@example.com",  country: "Australia", totalOrders: 1, totalSpent: 33,   createdAt: new Date(Date.now() - 1*24*3600*1000).toISOString() },
      ]);
    }

    // --- Demo Reviews ---
    if (!dbGet(DB_KEYS.reviews)) {
      dbSet(DB_KEYS.reviews, [
        { id: uid(), productId: "p001", productName: "Ceylon Cinnamon Quills", author: "Maria D.",  country: "Canada",    rating: 5, title: "Incredible quality", body: "The Ceylon cinnamon is unlike anything from the supermarket — so much sweeter and softer. Shipping to Toronto took 8 days.", approved: true,  createdAt: new Date(Date.now() - 7*24*3600*1000).toISOString() },
        { id: uid(), productId: "p013", productName: "Wild Forest Honey",      author: "Luca R.",   country: "Italy",     rating: 5, title: "Best honey I've tasted", body: "Beautifully packed, and the wild honey is the best I've tasted. Will be reordering the coffee next.", approved: true,  createdAt: new Date(Date.now() - 5*24*3600*1000).toISOString() },
        { id: uid(), productId: "p009", productName: "Butterfly Pea Flower Tea", author: "Sarah K.", country: "USA",      rating: 5, title: "Daily ritual", body: "Love that every product lists exactly where it's from. The butterfly pea tea is now a daily ritual in our house.", approved: true,  createdAt: new Date(Date.now() - 3*24*3600*1000).toISOString() },
        { id: uid(), productId: "p007", productName: "Ceylon Orthodox Black Tea", author: "James W.", country: "Australia", rating: 4, title: "Great tea", body: "Really lovely flavour, proper orthodox leaf tea. Packaging was excellent.", approved: false, createdAt: new Date(Date.now() - 1*24*3600*1000).toISOString() },
      ]);
    }

    // --- Newsletter ---
    if (!dbGet(DB_KEYS.newsletter)) {
      dbSet(DB_KEYS.newsletter, [
        { id: uid(), email: "maria@example.com",  name: "Maria D.", subscribedAt: new Date(Date.now() - 30*24*3600*1000).toISOString(), active: true },
        { id: uid(), email: "sarah@example.com",  name: "Sarah K.", subscribedAt: new Date(Date.now() - 10*24*3600*1000).toISOString(), active: true },
        { id: uid(), email: "james@example.com",  name: "James W.", subscribedAt: new Date(Date.now() - 2*24*3600*1000).toISOString(), active: true },
      ]);
    }

    // --- Settings ---
    if (!dbGet(DB_KEYS.settings)) {
      dbSet(DB_KEYS.settings, {
        storeName: "Buy Alchimia",
        tagline: "Ceylon's finest, bottled honestly.",
        email: "hello@buyalchimia.com",
        phone: "+94 71 234 5678",
        address: "Kurunegala, Sri Lanka",
        currency: "USD",
        currencySymbol: "$",
        freeShippingThreshold: 75,
        defaultShippingCost: 9,
        googleClientId: "",
        stripeKey: "",
        paypalClientId: "",
        whatsapp: "94712345678",
        instagram: "buyalchimia",
        facebook: "buyalchimia",
        metaTitle: "Buy Alchimia — Premium Organic Products from Sri Lanka",
        metaDescription: "Premium Ceylon cinnamon, spices, tea, coffee, honey and wellness products, sourced directly from Sri Lanka and shipped worldwide.",
      });
    }

    // --- Blog ---
    if (!dbGet(DB_KEYS.blog)) {
      dbSet(DB_KEYS.blog, [
        { id: uid(), title: "Why True Ceylon Cinnamon Is Different", slug: "true-ceylon-cinnamon", excerpt: "Learn the difference between true Ceylon cinnamon and common cassia.", body: "Ceylon cinnamon (Cinnamomum verum) is grown exclusively in Sri Lanka and is prized worldwide for its refined, low-coumarin profile — softer and sweeter than common cassia...", category: "Education", author: "Alchimia Team", published: true, image: null, createdAt: new Date(Date.now() - 14*24*3600*1000).toISOString() },
        { id: uid(), title: "The Art of Hand-Rolling Cinnamon Quills", slug: "hand-rolling-cinnamon", excerpt: "An ancient craft that separates good cinnamon from exceptional cinnamon.", body: "In the small farms of Matale, skilled artisans peel cinnamon bark by hand using techniques passed down for generations...", category: "Craftsmanship", author: "Alchimia Team", published: true, image: null, createdAt: new Date(Date.now() - 7*24*3600*1000).toISOString() },
        { id: uid(), title: "Butterfly Pea Tea: The Colour-Changing Wonder", slug: "butterfly-pea-tea", excerpt: "The science behind the magical blue-to-purple colour shift.", body: "Butterfly pea flowers contain anthocyanins — pH-sensitive pigments that shift from deep blue to vibrant violet when you add a squeeze of citrus...", category: "Education", author: "Alchimia Team", published: false, image: null, createdAt: new Date(Date.now() - 2*24*3600*1000).toISOString() },
      ]);
    }

    // --- Media ---
    if (!dbGet(DB_KEYS.media)) {
      dbSet(DB_KEYS.media, []);
    }
  },

  _tagsFor(category) {
    const map = {
      "Spices": ["organic", "ceylon", "aromatic", "cooking"],
      "Tea": ["ceylon", "orthodox", "loose-leaf", "caffeine"],
      "Herbal Tea": ["caffeine-free", "herbal", "wellness", "floral"],
      "Coffee": ["single-origin", "arabica", "medium-roast", "small-batch"],
      "Honey": ["raw", "unfiltered", "wildflower", "cold-extracted"],
      "Wellness": ["supplements", "turmeric", "ginger", "moringa"],
      "Essential Oils": ["steam-distilled", "pure", "aromatherapy", "ceylon"],
    };
    return map[category] || ["organic", "ceylon"];
  },

  /* ============================================================
     PRODUCTS
  ============================================================ */
  products: {
    getAll() { return dbGet(DB_KEYS.products) || []; },
    getActive() { return DB.products.getAll().filter(p => p.active !== false); },
    getById(id) { return DB.products.getAll().find(p => p.id === id) || null; },
    getByCategory(cat) { return DB.products.getActive().filter(p => p.category === cat); },
    getFeatured(n = 8) { return DB.products.getActive().slice(0, n); },
    add(data) {
      const products = DB.products.getAll();
      const product = {
        ...data,
        id: data.id || "p" + uid(),
        sku: data.sku || "ALK-" + uid().toUpperCase(),
        active: true,
        createdAt: now(),
        updatedAt: now(),
      };
      products.push(product);
      dbSet(DB_KEYS.products, products);
      return product;
    },
    update(id, data) {
      const products = DB.products.getAll();
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) return null;
      products[idx] = { ...products[idx], ...data, updatedAt: now() };
      dbSet(DB_KEYS.products, products);
      return products[idx];
    },
    delete(id) {
      const products = DB.products.getAll().filter(p => p.id !== id);
      dbSet(DB_KEYS.products, products);
    },
    updateStock(id, delta) {
      const p = DB.products.getById(id);
      if (!p) return;
      DB.products.update(id, { stock: Math.max(0, (p.stock || 0) + delta) });
    },
    search(term) {
      const t = term.toLowerCase();
      return DB.products.getActive().filter(p =>
        p.name.toLowerCase().includes(t) ||
        p.description.toLowerCase().includes(t) ||
        p.category.toLowerCase().includes(t) ||
        (p.tags || []).some(tag => tag.includes(t))
      );
    },
  },

  /* ============================================================
     ORDERS
  ============================================================ */
  orders: {
    getAll() { return dbGet(DB_KEYS.orders) || []; },
    getById(id) { return DB.orders.getAll().find(o => o.id === id) || null; },
    getByStatus(status) { return DB.orders.getAll().filter(o => o.status === status); },
    getByCustomerEmail(email) { return DB.orders.getAll().filter(o => o.customer.email === email); },
    add(data) {
      const orders = DB.orders.getAll();
      const order = {
        ...data,
        id: "ORD-" + String(orders.length + 1).padStart(4, "0"),
        status: data.status || "pending",
        createdAt: now(),
        updatedAt: now(),
      };
      orders.unshift(order);
      dbSet(DB_KEYS.orders, orders);
      // Register customer
      DB.customers._upsert(order.customer, order.total);
      return order;
    },
    updateStatus(id, status) {
      const orders = DB.orders.getAll();
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) return null;
      orders[idx] = { ...orders[idx], status, updatedAt: now() };
      dbSet(DB_KEYS.orders, orders);
      return orders[idx];
    },
    update(id, data) {
      const orders = DB.orders.getAll();
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) return null;
      orders[idx] = { ...orders[idx], ...data, updatedAt: now() };
      dbSet(DB_KEYS.orders, orders);
      return orders[idx];
    },
    stats() {
      const orders = DB.orders.getAll();
      const revenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);
      const thisMonth = orders.filter(o => {
        const d = new Date(o.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      return {
        total: orders.length,
        revenue,
        monthlyRevenue: thisMonth.reduce((s, o) => s + (o.total || 0), 0),
        monthlyOrders: thisMonth.length,
        pending: orders.filter(o => o.status === "pending").length,
        processing: orders.filter(o => o.status === "processing").length,
        shipped: orders.filter(o => o.status === "shipped").length,
        delivered: orders.filter(o => o.status === "delivered").length,
      };
    },
    exportCSV() {
      const orders = DB.orders.getAll();
      const rows = [["Order ID","Status","Customer","Email","Country","Items","Total","Payment","Date"]];
      orders.forEach(o => {
        rows.push([
          o.id, o.status, o.customer.name, o.customer.email, o.customer.country,
          o.items.map(i => `${i.name} x${i.qty}`).join("; "),
          o.total.toFixed(2), o.paymentMethod,
          new Date(o.createdAt).toLocaleDateString()
        ]);
      });
      return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    },
  },

  /* ============================================================
     CUSTOMERS
  ============================================================ */
  customers: {
    getAll() { return dbGet(DB_KEYS.customers) || []; },
    getById(id) { return DB.customers.getAll().find(c => c.id === id) || null; },
    getByEmail(email) { return DB.customers.getAll().find(c => c.email === email) || null; },
    add(data) {
      const customers = DB.customers.getAll();
      // Avoid duplicate emails
      if (data.email && customers.find(c => c.email === data.email)) return null;
      const customer = { id: uid(), ...data, createdAt: data.createdAt || now() };
      customers.push(customer);
      dbSet(DB_KEYS.customers, customers);
      return customer;
    },
    update(id, data) {
      const customers = DB.customers.getAll();
      const idx = customers.findIndex(c => c.id === id);
      if (idx === -1) return null;
      customers[idx] = { ...customers[idx], ...data };
      dbSet(DB_KEYS.customers, customers);
      return customers[idx];
    },
    delete(id) {
      dbSet(DB_KEYS.customers, DB.customers.getAll().filter(c => c.id !== id));
    },
    _upsert(customerData, orderTotal) {
      const customers = DB.customers.getAll();
      const existing = customers.find(c => c.email === customerData.email);
      if (existing) {
        existing.totalOrders = (existing.totalOrders || 0) + 1;
        existing.totalSpent  = (existing.totalSpent  || 0) + orderTotal;
      } else {
        customers.push({
          id: uid(),
          name:   customerData.name,
          email:  customerData.email,
          country: customerData.country || "",
          totalOrders: 1,
          totalSpent:  orderTotal,
          createdAt: now(),
        });
      }
      dbSet(DB_KEYS.customers, customers);
    },
  },

  /* ============================================================
     REVIEWS
  ============================================================ */
  reviews: {
    getAll()        { return dbGet(DB_KEYS.reviews) || []; },
    getApproved()   { return DB.reviews.getAll().filter(r => r.approved); },
    getByProduct(productId) { return DB.reviews.getApproved().filter(r => r.productId === productId); },
    avgRating(productId) {
      const r = DB.reviews.getByProduct(productId);
      if (!r.length) return 0;
      return r.reduce((s, x) => s + x.rating, 0) / r.length;
    },
    add(data) {
      const reviews = DB.reviews.getAll();
      const review = { ...data, id: uid(), approved: false, createdAt: now() };
      reviews.unshift(review);
      dbSet(DB_KEYS.reviews, reviews);
      return review;
    },
    approve(id) {
      const reviews = DB.reviews.getAll();
      const r = reviews.find(x => x.id === id);
      if (r) r.approved = true;
      dbSet(DB_KEYS.reviews, reviews);
    },
    delete(id) {
      dbSet(DB_KEYS.reviews, DB.reviews.getAll().filter(r => r.id !== id));
    },
  },

  /* ============================================================
     COUPONS
  ============================================================ */
  coupons: {
    getAll()  { return dbGet(DB_KEYS.coupons) || []; },
    getById(id) { return DB.coupons.getAll().find(c => c.id === id); },
    getByCode(code) { return DB.coupons.getAll().find(c => c.code.toUpperCase() === code.toUpperCase() && c.active); },
    apply(code, subtotal) {
      const coupon = DB.coupons.getByCode(code);
      if (!coupon) return { valid: false, error: "Invalid coupon code." };
      if (coupon.minOrder && subtotal < coupon.minOrder) return { valid: false, error: `Minimum order $${coupon.minOrder} required.` };
      if (coupon.usageLimit && coupon.used >= coupon.usageLimit) return { valid: false, error: "Coupon usage limit reached." };
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { valid: false, error: "Coupon has expired." };
      const discount = coupon.type === "percent" ? subtotal * (coupon.value / 100) : coupon.value;
      return { valid: true, discount: Math.min(discount, subtotal), type: coupon.type, value: coupon.value, coupon };
    },
    use(code) {
      const coupons = DB.coupons.getAll();
      const c = coupons.find(x => x.code.toUpperCase() === code.toUpperCase());
      if (c) c.used = (c.used || 0) + 1;
      dbSet(DB_KEYS.coupons, coupons);
    },
    add(data) {
      const coupons = DB.coupons.getAll();
      const coupon = { ...data, id: uid(), used: 0, createdAt: now() };
      coupons.push(coupon);
      dbSet(DB_KEYS.coupons, coupons);
      return coupon;
    },
    update(id, data) {
      const coupons = DB.coupons.getAll();
      const idx = coupons.findIndex(c => c.id === id);
      if (idx > -1) coupons[idx] = { ...coupons[idx], ...data };
      dbSet(DB_KEYS.coupons, coupons);
    },
    delete(id) {
      dbSet(DB_KEYS.coupons, DB.coupons.getAll().filter(c => c.id !== id));
    },
  },

  /* ============================================================
     NEWSLETTER
  ============================================================ */
  newsletter: {
    getAll()     { return dbGet(DB_KEYS.newsletter) || []; },
    getActive()  { return DB.newsletter.getAll().filter(s => s.active); },
    subscribe(email, name = "") {
      const subs = DB.newsletter.getAll();
      if (subs.find(s => s.email === email)) return { success: false, message: "Already subscribed." };
      const sub = { id: uid(), email, name, subscribedAt: now(), active: true };
      subs.push(sub);
      dbSet(DB_KEYS.newsletter, subs);
      return { success: true };
    },
    unsubscribe(email) {
      const subs = DB.newsletter.getAll();
      const s = subs.find(x => x.email === email);
      if (s) s.active = false;
      dbSet(DB_KEYS.newsletter, subs);
    },
    delete(id) {
      dbSet(DB_KEYS.newsletter, DB.newsletter.getAll().filter(s => s.id !== id));
    },
    exportCSV() {
      const subs = DB.newsletter.getActive();
      const rows = [["Email","Name","Subscribed At"]];
      subs.forEach(s => rows.push([s.email, s.name, new Date(s.subscribedAt).toLocaleDateString()]));
      return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    },
  },

  /* ============================================================
     CATEGORIES
  ============================================================ */
  categories: {
    getAll()    { return dbGet(DB_KEYS.categories) || []; },
    getActive() { return DB.categories.getAll().filter(c => c.active); },
    getById(id) { return DB.categories.getAll().find(c => c.id === id); },
    add(data) {
      const cats = DB.categories.getAll();
      const cat = { ...data, id: "cat-" + uid(), active: true };
      cats.push(cat);
      dbSet(DB_KEYS.categories, cats);
      return cat;
    },
    update(id, data) {
      const cats = DB.categories.getAll();
      const idx = cats.findIndex(c => c.id === id);
      if (idx > -1) cats[idx] = { ...cats[idx], ...data };
      dbSet(DB_KEYS.categories, cats);
    },
    delete(id) {
      dbSet(DB_KEYS.categories, DB.categories.getAll().filter(c => c.id !== id));
    },
  },

  /* ============================================================
     SETTINGS
  ============================================================ */
  settings: {
    get() { return dbGet(DB_KEYS.settings) || {}; },
    update(data) {
      const s = DB.settings.get();
      dbSet(DB_KEYS.settings, { ...s, ...data });
    },
  },

  /* ============================================================
     BLOG
  ============================================================ */
  blog: {
    getAll()       { return dbGet(DB_KEYS.blog) || []; },
    getPublished() { return DB.blog.getAll().filter(b => b.published); },
    getById(id)    { return DB.blog.getAll().find(b => b.id === id); },
    add(data) {
      const posts = DB.blog.getAll();
      const post = { ...data, id: uid(), createdAt: now() };
      posts.unshift(post);
      dbSet(DB_KEYS.blog, posts);
      return post;
    },
    update(id, data) {
      const posts = DB.blog.getAll();
      const idx = posts.findIndex(p => p.id === id);
      if (idx > -1) posts[idx] = { ...posts[idx], ...data, updatedAt: now() };
      dbSet(DB_KEYS.blog, posts);
    },
    delete(id) {
      dbSet(DB_KEYS.blog, DB.blog.getAll().filter(p => p.id !== id));
    },
  },

  /* ============================================================
     MEDIA
  ============================================================ */
  media: {
    getAll() { return dbGet(DB_KEYS.media) || []; },
    add(data) {
      const media = DB.media.getAll();
      const item = { ...data, id: uid(), uploadedAt: now() };
      media.unshift(item);
      dbSet(DB_KEYS.media, media);
      return item;
    },
    delete(id) {
      dbSet(DB_KEYS.media, DB.media.getAll().filter(m => m.id !== id));
    },
  },

  /* ============================================================
     ANALYTICS HELPERS
  ============================================================ */
  analytics: {
    revenueByDay(days = 30) {
      const orders = DB.orders.getAll().filter(o => o.status !== "cancelled");
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const dayOrders = orders.filter(o => {
          const od = new Date(o.createdAt);
          return od.toDateString() === d.toDateString();
        });
        result.push({ label, revenue: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length });
      }
      return result;
    },
    topProducts(n = 5) {
      const orders = DB.orders.getAll().filter(o => o.status !== "cancelled");
      const map = {};
      orders.forEach(o => {
        (o.items || []).forEach(item => {
          if (!map[item.id]) map[item.id] = { id: item.id, name: item.name, qty: 0, revenue: 0 };
          map[item.id].qty += item.qty;
          map[item.id].revenue += item.price * item.qty;
        });
      });
      return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, n);
    },
  },
};

/* Auto-init when loaded */
document.addEventListener("DOMContentLoaded", () => {
  if (window.ALCHIMIA_FALLBACK_PRODUCTS) DB.init();
});

/* Override fetchProducts to prefer DB data */
window.fetchProductsFromDB = function() {
  return DB.products.getActive();
};
