/* ============================================================
   BUY ALCHIMIA — Wishlist module
   ============================================================ */
const WISHLIST_KEY = "alchimia_wishlist";

const Wishlist = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  has(id) {
    return Wishlist.get().includes(id);
  },
  toggle(id) {
    let list = Wishlist.get();
    if (list.includes(id)) list = list.filter((x) => x !== id);
    else list.push(id);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    Wishlist.updateBadge();
    return list.includes(id);
  },
  count() {
    return Wishlist.get().length;
  },
  updateBadge() {
    document.querySelectorAll(".wishlist-count").forEach((el) => {
      el.textContent = Wishlist.count();
    });
  }
};

document.addEventListener("DOMContentLoaded", Wishlist.updateBadge);

/* Delegate clicks on any .wish-btn rendered anywhere in the app */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".wish-btn");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const id = btn.dataset.id;
  const active = Wishlist.toggle(id);
  btn.classList.toggle("active", active);
  btn.textContent = active ? "♥" : "♡";
  btn.classList.remove("pop");
  void btn.offsetWidth;
  btn.classList.add("pop");
  if (typeof showToast === "function") {
    showToast(active ? "Added to wishlist" : "Removed from wishlist");
  }
});
