/* Homepage: category tiles, best-seller grid, Instagram-style gallery */
(async function initHome() {
  const featuredGrid = document.getElementById("featured-grid");
  const categoryGrid = document.getElementById("category-grid");
  const galleryGrid = document.getElementById("gallery-grid");
  if (!featuredGrid) return; // not the homepage

  const products = await fetchProducts();

  // ---- Featured categories ----
  const categoryMeta = {
    Spices: { icon: "cinnamonQuills", blurb: "Cinnamon, pepper & more" },
    Tea: { icon: "teaLeaf", blurb: "Ceylon orthodox leaf tea" },
    "Herbal Tea": { icon: "lotusFlower", blurb: "Caffeine-free infusions" },
    Coffee: { icon: "coffeeBean", blurb: "Single-origin arabica" },
    Honey: { icon: "honeyJar", blurb: "Raw wildflower honey" },
    Wellness: { icon: "herbalCapsule", blurb: "Everyday supplements" },
    "Essential Oils": { icon: "oilDropper", blurb: "Steam-distilled purity" }
  };
  const categories = [...new Set(products.map((p) => p.category))];
  if (categoryGrid) {
    categoryGrid.innerHTML = categories
      .map((c) => {
        const meta = categoryMeta[c] || { icon: "leafBottle", blurb: "" };
        return `
        <a href="products.html?category=${encodeURIComponent(c)}" class="product-card reveal-child" style="text-align:center;">
          <div class="product-thumb" style="aspect-ratio:1/.8;">${window.ALCHIMIA_ICONS[meta.icon] || ""}</div>
          <div class="product-info" style="align-items:center;">
            <h3 style="font-size:.95rem;">${c}</h3>
            <p class="product-desc" style="text-align:center;">${meta.blurb}</p>
          </div>
        </a>`;
      })
      .join("");
  }

  // ---- Best sellers (first 8 products) ----
  const bestSellers = products.slice(0, 8);
  featuredGrid.innerHTML = bestSellers.map((p) => productCardHTML(p, "reveal-child")).join("");
  bindProductCardEvents(featuredGrid, products);

  // ---- Instagram-style gallery ----
  if (galleryGrid) {
    const galleryIcons = products.slice(0, 6).map((p) => p.icon);
    galleryGrid.innerHTML = galleryIcons
      .map((icon) => `<div class="gallery-tile reveal-child">${window.ALCHIMIA_ICONS[icon] || ""}</div>`)
      .join("");
  }

  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Subscribed — welcome to the grove 🌿");
      newsletterForm.reset();
    });
  }
})();
