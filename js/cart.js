/* ============================================================
   BUY ALCHIMIA — Cart module
   Cart is kept in localStorage as [{id, qty}].
   ============================================================ */
const CART_KEY = "alchimia_cart";

const Cart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  save(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    Cart.updateBadge();
  },
  add(id, qty = 1) {
    const cart = Cart.get();
    const existing = cart.find((c) => c.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ id, qty });
    Cart.save(cart);
  },
  updateQty(id, qty) {
    let cart = Cart.get();
    if (qty <= 0) {
      cart = cart.filter((c) => c.id !== id);
    } else {
      const item = cart.find((c) => c.id === id);
      if (item) item.qty = qty;
    }
    Cart.save(cart);
  },
  remove(id) {
    const cart = Cart.get().filter((c) => c.id !== id);
    Cart.save(cart);
  },
  clear() {
    Cart.save([]);
  },
  count() {
    return Cart.get().reduce((sum, c) => sum + c.qty, 0);
  },
  updateBadge() {
    const el = document.getElementById("cart-count");
    if (el) el.textContent = Cart.count();
  }
};

async function fetchProducts() {
  try {
    const res = await fetch('/api/products.php');
    if (res.ok) {
      const data = await res.json();
      return data.filter(p => p.active);
    }
  } catch (e) {
    console.error("Error fetching products:", e);
  }
  return [];
}
function formatPrice(n) {
  const symbol = (window.ALCHIMIA_CONFIG && window.ALCHIMIA_CONFIG.CURRENCY_SYMBOL) || "$";
  return `${symbol}${Number(n).toFixed(2)}`;
}

/* Shared product card markup used on homepage + shop grid */
function productCardHTML(p, extraClass) {
  const inWishlist = typeof Wishlist !== "undefined" && Wishlist.has(p.id);
  const oldPrice = p.discount_price || p.oldPrice;
  const discount = oldPrice ? Math.round((1 - p.price / oldPrice) * 100) : 0;
  const lowStock = p.stock !== undefined && p.stock < 15;
  const reviewCount = 24 + (p.id.charCodeAt(2) % 40);
  
  let imageSrc = null;
  if (p.images && p.images.length > 0) imageSrc = p.images[0];
  else if (p.image) imageSrc = p.image;

  return `
    <a href="product.html?id=${p.id}" class="product-card ${extraClass || ""}">
      <div class="product-thumb">
        ${discount ? `<span class="badge-sale">-${discount}%</span>` : `<span class="badge-organic">Organic</span>`}
        <button class="wish-btn ${inWishlist ? "active" : ""}" data-id="${p.id}" title="Add to wishlist" type="button">${inWishlist ? "♥" : "♡"}</button>
        ${imageSrc ? `<img src="${imageSrc}" style="width:100%;height:100%;object-fit:cover;">` : (window.ALCHIMIA_ICONS[p.icon] || "")}
        <button class="btn-outline quick-view-btn" data-id="${p.id}" type="button"
          style="position:absolute;bottom:12px;left:12px;right:12px;background:rgba(255,255,255,0.92);font-size:.78rem;padding:.6rem;opacity:0;transform:translateY(8px);transition:all .25s var(--ease);">
          Quick View
        </button>
      </div>
      <div class="product-info">
        <span class="product-tag">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="rating-line">★★★★★ <span>(${reviewCount})</span></div>
        <p class="product-desc">${p.description}</p>
        ${p.stock !== undefined ? `<div class="stock-line ${lowStock ? "low" : ""}"><span class="dot"></span>${lowStock ? `Only ${p.stock} left` : "In stock"}</div>` : ""}
        <div class="product-foot">
          <span class="price">${oldPrice ? `<span class="old">${formatPrice(oldPrice)}</span>` : ""}${formatPrice(p.price)}</span>
          <button class="add-btn" data-id="${p.id}" title="Add to cart" type="button">+</button>
        </div>
      </div>
    </a>`;
}

/* Wire up quick-view triggers + thumb hover reveal within a container */
function bindProductCardEvents(container, products) {
  container.addEventListener("click", (e) => {
    const qvBtn = e.target.closest(".quick-view-btn");
    if (qvBtn) {
      e.preventDefault();
      e.stopPropagation();
      const product = products.find((p) => p.id === qvBtn.dataset.id);
      if (product && typeof openQuickView === "function") openQuickView(product);
      return;
    }
    const addBtn = e.target.closest(".add-btn");
    if (addBtn) {
      e.preventDefault();
      e.stopPropagation();
      Cart.add(addBtn.dataset.id, 1);
      showToast("Added to cart");
    }
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

document.addEventListener("DOMContentLoaded", Cart.updateBadge);
