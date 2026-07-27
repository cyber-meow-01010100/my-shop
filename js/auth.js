/* ============================================================
   BUY ALCHIMIA — Auth module
   Server-side sessions + Google OAuth 2.0.
   All authentication is verified against the backend.
   ============================================================ */

const USER_KEY = 'alchimia_user';

const Auth = {
  // In-memory cache (avoids repeated localStorage parses)
  _user: null,

  getUser() {
    if (Auth._user) return Auth._user;
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  },

  setUser(user) {
    Auth._user = user;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
    Auth.reflectHeader();
  },

  // Verify session with the backend and sync local cache.
  // Called on every page load — keeps the UI consistent with server state.
  async init() {
    try {
      const res = await fetch('/auth/me');
      const data = await res.json();
      if (data.loggedIn && data.user) {
        Auth._user = data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } else {
        // Session expired or never existed — clear stale local cache
        Auth._user = null;
        localStorage.removeItem(USER_KEY);
      }
    } catch {
      // Network error — fall back to whatever is in localStorage
    }
    Auth.reflectHeader();
  },

  async logout() {
    try {
      await fetch('/auth/logout', { method: 'POST' });
    } catch { /* ignore network errors on logout */ }
    Auth._user = null;
    localStorage.removeItem(USER_KEY);
    Auth.reflectHeader();
    if (typeof showToast === 'function') showToast('Signed out');
  },

  reflectHeader() {
    const link = document.getElementById('account-link');
    if (!link) return;
    const user = Auth.getUser();
    if (user) {
      if (user.picture) {
        link.innerHTML = `<img src="${user.picture}" alt="${user.name || ''}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">`;
      } else {
        const initials = (user.name || user.email || '?').charAt(0).toUpperCase();
        link.innerHTML = `<span style="width:26px;height:26px;border-radius:50%;background:var(--forest,#2E7D32);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;">${initials}</span>`;
      }
      link.title = user.name || user.email;
      link.href = 'login.html';
    } else {
      link.textContent = '👤';
      link.title = 'Account';
      link.href = 'login.html';
    }
  }
};

/* ---- Google Sign-In ---- */

// Called by Google's SDK after the user picks an account.
// Sends the credential to the backend for server-side verification.
async function handleGoogleCredential(response) {
  try {
    const res = await fetch('/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await res.json();
    if (data.success) {
      Auth.setUser(data.user);
      const firstName = (data.user.name || '').split(' ')[0] || 'there';
      if (typeof showToast === 'function') showToast(`Welcome, ${firstName}! ✓`);
      setTimeout(() => {
        const redirect = new URLSearchParams(location.search).get('redirect') || 'index.html';
        window.location.href = redirect;
      }, 900);
    } else {
      const msg = data.error || 'Google sign-in failed.';
      if (typeof showToast === 'function') showToast(msg);
      else alert(msg);
    }
  } catch (err) {
    console.error('Google sign-in error:', err);
    const msg = 'Google sign-in failed. Please try again.';
    if (typeof showToast === 'function') showToast(msg);
    else alert(msg);
  }
}

// Render the Google Sign-In button inside the given container element ID.
// initialize() is called only once; subsequent calls just render the button.
let _gsiInitialized = false;
function initGoogleSignIn(containerId) {
  const clientId = window.ALCHIMIA_CONFIG && window.ALCHIMIA_CONFIG.GOOGLE_CLIENT_ID;
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!clientId) {
    container.innerHTML = `<p style="font-size:.75rem;color:#9b9385;text-align:center;margin:0;">Google Sign-In is not configured.</p>`;
    return;
  }

  const tryRender = () => {
    if (!window.google || !window.google.accounts) return setTimeout(tryRender, 150);
    if (!_gsiInitialized) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential
      });
      _gsiInitialized = true;
    }
    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: 320,
      shape: 'pill'
    });
  };
  tryRender();
}

// Run session check + header update on every page load
document.addEventListener('DOMContentLoaded', () => Auth.init());
