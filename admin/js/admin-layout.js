/* ============================================================
   BUY ALCHIMIA ADMIN — Shared Layout Components
   Renders sidebar and topbar into pages dynamically.
   ============================================================ */

const ADMIN_NAV = [
  { section: "Main" },
  { label: "Dashboard",    href: "dashboard.html",   icon: "📊" },
  { label: "Analytics",   href: "analytics.html",   icon: "📈" },

  { section: "Catalogue" },
  { label: "Products",    href: "products.html",    icon: "📦" },
  { label: "Categories",  href: "categories.html",  icon: "🏷️" },
  { label: "Media Library", href: "media.html",     icon: "🖼️" },

  { section: "Sales" },
  { label: "Orders",      href: "orders.html",      icon: "🛒", badge: "pending" },
  { label: "Coupons",     href: "coupons.html",     icon: "🎟️" },

  { section: "Customers" },
  { label: "Customers",   href: "customers.html",   icon: "👥" },
  { label: "Reviews",     href: "reviews.html",     icon: "⭐", badge: "unapproved" },
  { label: "Newsletter",  href: "newsletter.html",  icon: "📧" },

  { section: "Content" },
  { label: "Blog",        href: "blog.html",        icon: "✍️" },

  { section: "System" },
  { label: "Settings",    href: "settings.html",    icon: "⚙️" },
];

function renderAdminLayout(pageTitle, pageSubtitle) {
  const currentPage = window.location.pathname.split("/").pop();

  // Sidebar
  let sidebarNav = "";
  ADMIN_NAV.forEach(item => {
    if (item.section) {
      sidebarNav += `<div class="sidebar-section-label">${item.section}</div>`;
    } else {
      const isActive = item.href === currentPage;
      let badgeHTML = "";
      if (item.badge === "pending") {
        const count = typeof DB !== "undefined" ? DB.orders.getAll().filter(o => o.status === "pending").length : 0;
        if (count > 0) badgeHTML = `<span class="sidebar-badge-count">${count}</span>`;
      } else if (item.badge === "unapproved") {
        const count = typeof DB !== "undefined" ? DB.reviews.getAll().filter(r => !r.approved).length : 0;
        if (count > 0) badgeHTML = `<span class="sidebar-badge-count">${count}</span>`;
      }
      sidebarNav += `<a href="${item.href}" class="sidebar-link ${isActive ? "active" : ""}">
        <span style="font-size:1rem;">${item.icon}</span>
        <span>${item.label}</span>
        ${badgeHTML}
      </a>`;
    }
  });

  const session = AdminAuth.getSession();
  const username = session ? session.username : "Admin";

  // Insert overlay for mobile
  const overlay = document.createElement("div");
  overlay.id = "sidebar-overlay";
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99;display:none;";
  overlay.addEventListener("click", () => {
    document.querySelector(".admin-sidebar")?.classList.remove("open");
    overlay.style.display = "none";
  });

  const sidebarHTML = `
    <aside class="admin-sidebar" id="admin-sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-text"><span>Buy</span>Alchimia</div>
        <div class="sidebar-badge">Admin Panel</div>
      </div>
      <nav class="sidebar-nav">${sidebarNav}</nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">${username.charAt(0).toUpperCase()}</div>
          <div>
            <div class="sidebar-user-name">${username}</div>
            <div class="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button onclick="AdminAuth.logout()" class="btn btn-ghost" style="width:100%;margin-top:8px;justify-content:center;font-size:.78rem;">Sign out →</button>
      </div>
    </aside>
  `;

  const topbarHTML = `
    <div class="admin-topbar">
      <div style="display:flex;align-items:center;gap:14px;">
        <button class="mobile-menu-btn" id="mobile-menu-btn" title="Menu">☰</button>
        <div>
          <div class="topbar-title">${pageTitle}</div>
          <div class="topbar-breadcrumb">Admin → ${pageTitle}</div>
        </div>
      </div>
      <div class="topbar-actions">
        <a href="../index.html" target="_blank" class="btn btn-secondary btn-sm" title="View storefront">🌐 Storefront</a>
        <button class="topbar-btn" title="Notifications" onclick="adminToast('No new notifications', 'info')">🔔</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("afterbegin", sidebarHTML);
  const mainEl = document.querySelector(".admin-main");
  if (mainEl) mainEl.insertAdjacentHTML("afterbegin", topbarHTML);
  document.body.appendChild(overlay);

  // Mobile menu
  document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
    const sidebar = document.getElementById("admin-sidebar");
    sidebar?.classList.toggle("open");
    overlay.style.display = sidebar?.classList.contains("open") ? "block" : "none";
  });

  // Update document title
  document.title = `${pageTitle} — Alchimia Admin`;
}

/* ============================================================
   SHARED ADMIN UTILITY FUNCTIONS
   Available globally on all admin pages.
   ============================================================ */

/**
 * Show a toast notification in the admin panel.
 * @param {string} msg - Message text.
 * @param {'success'|'error'|'warning'|'info'} type - Toast type.
 */
function adminToast(msg, type = 'success') {
  let toastEl = document.getElementById('admin-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'admin-toast';
    toastEl.style.cssText = `
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      padding: 14px 22px; border-radius: 10px;
      font-size: .88rem; font-weight: 500;
      font-family: var(--admin-font);
      box-shadow: 0 8px 32px rgba(0,0,0,.4);
      transition: all .3s ease;
      pointer-events: none;
      max-width: 360px;
    `;
    document.body.appendChild(toastEl);
  }
  const colors = {
    success: { bg: 'rgba(74,222,128,.15)', border: 'rgba(74,222,128,.3)', color: '#4ade80' },
    error:   { bg: 'rgba(239,68,68,.15)',  border: 'rgba(239,68,68,.3)',  color: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,.15)', border: 'rgba(245,158,11,.3)', color: '#f59e0b' },
    info:    { bg: 'rgba(99,179,237,.15)', border: 'rgba(99,179,237,.3)', color: '#63b3ed' },
  };
  const c = colors[type] || colors.success;
  toastEl.style.background = c.bg;
  toastEl.style.border = `1px solid ${c.border}`;
  toastEl.style.color = c.color;
  toastEl.textContent = msg;
  toastEl.style.opacity = '1';
  toastEl.style.transform = 'translateY(0)';

  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(10px)';
  }, 3500);
}

/**
 * Open a modal by ID.
 * @param {string} modalId
 */
function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (!el) return;
  el.style.display = 'flex';
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Close on backdrop click
  el.onclick = (e) => { if (e.target === el) closeModal(modalId); };
}

/**
 * Close a modal by ID.
 * @param {string} modalId
 */
function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (!el) return;
  el.style.display = 'none';
  el.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Format a date string for display.
 * @param {string} dateStr - ISO date string.
 * @returns {string} Formatted date like "Jul 26, 2026"
 */
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch(e) { return dateStr; }
}

/**
 * Format a datetime for display.
 * @param {string} dateStr
 * @returns {string}
 */
function fmtDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch(e) { return dateStr; }
}

/**
 * Format a currency value.
 * @param {number} val
 * @returns {string}
 */
function adminFmt$(val) {
  return '$' + Number(val || 0).toFixed(2);
}

/**
 * Escape HTML for safe insertion.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' };
  return String(str || '').replace(/[&<>"']/g, m => map[m]);
}

// Close modals on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});

