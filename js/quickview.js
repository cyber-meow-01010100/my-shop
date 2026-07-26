/* ============================================================
   BUY ALCHIMIA — Quick View modal
   Expects a #qv-overlay element in the page (see quick-view-modal.html partial,
   inlined at the bottom of shop/product listing pages).
   ============================================================ */
function openQuickView(product) {
  let overlay = document.getElementById("qv-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "qv-overlay";
    overlay.className = "qv-overlay";
    document.body.appendChild(overlay);
  }

  const inWishlist = typeof Wishlist !== "undefined" && Wishlist.has(product.id);

  overlay.innerHTML = `
    <div class="qv-modal">
      <button class="qv-close" type="button" aria-label="Close">✕</button>
      <div class="qv-art">${window.ALCHIMIA_ICONS[product.icon] || ""}</div>
      <div class="qv-info">
        <span class="eyebrow">${product.category}</span>
        <h2 style="margin:6px 0 10px;">${product.name}</h2>
        <div class="rating-line">★★★★★ <span>(${(24 + (product.id.charCodeAt(2) % 40))} reviews)</span></div>
        <div class="price" style="font-size:1.3rem;margin:10px 0;">${product.oldPrice ? `<span class="old">${formatPrice(product.oldPrice)}</span>` : ""}${formatPrice(product.price)}</div>
        <p style="color:#4a564c;font-size:.92rem;">${product.description}</p>
        <div class="stock-line ${product.stock < 15 ? "low" : ""}"><span class="dot"></span>${product.stock < 15 ? `Only ${product.stock} left` : "In stock"} · ${product.unit}</div>
        <div style="display:flex;gap:10px;margin-top:22px;">
          <button class="btn-primary" id="qv-add-btn" style="flex:1;" type="button">Add to Cart</button>
          <button class="wish-btn ${inWishlist ? "active" : ""}" data-id="${product.id}" style="position:static;box-shadow:none;border:1px solid var(--paper-line);width:48px;height:48px;">${inWishlist ? "♥" : "♡"}</button>
        </div>
        <a href="product.html?id=${product.id}" class="btn-outline btn-block" style="margin-top:10px;">View full details</a>
      </div>
    </div>
  `;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  overlay.querySelector(".qv-close").addEventListener("click", closeQuickView);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeQuickView();
  });
  overlay.querySelector("#qv-add-btn").addEventListener("click", () => {
    Cart.add(product.id, 1);
    showToast("Added to cart");
    closeQuickView();
  });
}

function closeQuickView() {
  const overlay = document.getElementById("qv-overlay");
  if (overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeQuickView();
});
