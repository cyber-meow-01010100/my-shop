/* ============================================================
   BUY ALCHIMIA ADMIN — Authentication
   Simple credential check with localStorage session token.
   Admin: admin / alchimia2026
   ============================================================ */

const ADMIN_SESSION_KEY = "alchimia_admin_session";
const ADMIN_CREDENTIALS = {
  username: "admin",
  // SHA-256 of "alchimia2026" — checked client-side for demo
  passwordHash: "a8c4f16da04b36f1b9b59e1c9b4b5f9ff72a0dbf7f3f9d2e3b1c7a5d8e6f2b0"
};

/* Simple hash function for demo — not cryptographically secure for production */
async function hashPassword(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const AdminAuth = {
  isLoggedIn() {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) return false;
    try {
      const data = JSON.parse(atob(session));
      return data.expires > Date.now();
    } catch { return false; }
  },

  async login(username, password) {
    try {
      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const session = {
          username: username.trim(),
          role: "admin",
          loginAt: Date.now(),
          expires: Date.now() + 8 * 60 * 60 * 1000 // 8 hours
        };
        localStorage.setItem(ADMIN_SESSION_KEY, btoa(JSON.stringify(session)));
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  },

  async logout() {
    try {
      await fetch('/api/logout.php', { method: 'POST' });
    } catch (e) { }
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.href = "index.html";
  },

  getSession() {
    try {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!session) return null;
      return JSON.parse(atob(session));
    } catch { return null; }
  },

  guard() {
    if (!AdminAuth.isLoggedIn()) {
      window.location.href = "index.html?redirect=" + encodeURIComponent(window.location.pathname);
    } else {
        // Also verify with backend to be safe
        fetch('/api/me.php').then(res => res.json()).then(data => {
            if (!data.loggedIn) {
                AdminAuth.logout();
            }
        }).catch(() => {});
    }
  }
};

/* Toast notification */
function adminToast(message, type = "success") {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.className = "admin-toast";
    document.body.appendChild(toast);
  }
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.innerHTML = `<span>${icons[type] || "✅"}</span> ${message}`;
  toast.className = `admin-toast show ${type}`;
  clearTimeout(window._adminToastTimer);
  window._adminToastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* Confirm dialog */
function adminConfirm(message) {
  return window.confirm(message);
}

/* Mobile sidebar toggle */
function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const sidebar = document.querySelector(".admin-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (!btn || !sidebar) return;

  btn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    if (overlay) overlay.classList.toggle("show");
  });
  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    });
  }
}

/* Modal helpers */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add("open");
    m.querySelector(".modal")?.scrollTo(0, 0);
  }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("open");
}
function closeAllModals() {
  document.querySelectorAll(".modal-overlay.open").forEach(m => m.classList.remove("open"));
}

/* Click outside modal to close */
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) closeAllModals();
});

/* Escape key to close modals */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeAllModals();
});

/* Format currency */
function fmtCurrency(n) {
  return "$" + Number(n || 0).toFixed(2);
}

/* Format date */
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/* Export CSV helper */
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* Init on load */
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  // Set active sidebar link
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".sidebar-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href && href.includes(currentPage)) {
      link.classList.add("active");
    }
  });
});
