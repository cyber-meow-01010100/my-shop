/* ============================================================
   BUY ALCHIMIA — Animations & interactions
   Scroll reveal, mobile nav drawer, small delight touches.
   ============================================================ */

/* ---- Scroll reveal ---- */
(function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal, .stagger");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((t) => observer.observe(t));
})();

/* ---- Mobile nav drawer ---- */
(function initMobileNav() {
  const toggle = document.querySelector(".mobile-toggle");
  const drawer = document.getElementById("nav-drawer");
  if (!toggle || !drawer) return;

  function close() {
    toggle.classList.remove("open");
    drawer.classList.remove("open");
    document.body.style.overflow = "";
  }
  function open() {
    toggle.classList.add("open");
    drawer.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  toggle.addEventListener("click", () => {
    drawer.classList.contains("open") ? close() : open();
  });
  drawer.querySelectorAll("a, .nav-drawer-overlay").forEach((el) => {
    el.addEventListener("click", close);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

/* ---- Cart badge bump on change ---- */
(function hookCartBump() {
  if (typeof Cart === "undefined") return;
  const originalSave = Cart.save;
  Cart.save = function (cart) {
    originalSave(cart);
    const badge = document.getElementById("cart-count");
    if (badge) {
      badge.classList.remove("bump");
      // eslint-disable-next-line no-unused-expressions
      void badge.offsetWidth; // restart animation
      badge.classList.add("bump");
    }
  };
})();

/* ---- Animated counters ---- */
(function initCounters() {
  const counters = document.querySelectorAll(".counter-num[data-target]");
  if (!counters.length || !("IntersectionObserver" in window)) return;

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => obs.observe(c));
})();

/* ---- FAQ accordion ---- */
document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-q");
  const a = item.querySelector(".faq-a");
  if (!q || !a) return;
  q.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    item.closest(".faq-list")
      .querySelectorAll(".faq-item.open")
      .forEach((openItem) => {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-a").style.maxHeight = null;
      });
    if (!isOpen) {
      item.classList.add("open");
      a.style.maxHeight = a.scrollHeight + "px";
    }
  });
});

/* ---- Search overlay ---- */
(function initSearchOverlay() {
  const openBtn = document.getElementById("search-trigger");
  const overlay = document.getElementById("search-overlay");
  if (!openBtn || !overlay) return;
  const input = overlay.querySelector("input");
  const form = overlay.querySelector("form");
  const closeBtn = overlay.querySelector(".search-box button[type='button']");

  function open() {
    overlay.classList.add("open");
    setTimeout(() => input && input.focus(), 200);
  }
  function close() {
    overlay.classList.remove("open");
  }
  openBtn.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
  form &&
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const term = input.value.trim();
      if (term) window.location.href = `products.html?q=${encodeURIComponent(term)}`;
    });
})();

/* ---- Add-to-cart button pop ---- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) {
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
  }
});
