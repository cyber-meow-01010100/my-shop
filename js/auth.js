/* ============================================================
   BUY ALCHIMIA — Auth module (Google Sign-In)
   Uses Google Identity Services. Real login requires a valid
   GOOGLE_CLIENT_ID in js/config.js — see README for setup.
   ============================================================ */
const USER_KEY = "alchimia_user";

const Auth = {
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    Auth.reflectHeader();
  },
  logout() {
    localStorage.removeItem(USER_KEY);
    Auth.reflectHeader();
    showToast && showToast("Signed out");
  },
  reflectHeader() {
    const link = document.getElementById("account-link");
    if (!link) return;
    const user = Auth.getUser();
    if (user) {
      link.innerHTML = `<img src="${user.picture || ""}" alt="${user.name}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;${user.picture ? "" : "display:none"}">`;
      link.title = user.name || user.email;
      link.href = "cart.html";
    } else {
      link.textContent = "👤";
      link.title = "Account";
      link.href = "login.html";
    }
  }
};

/* Called by Google's script via data-callback in the HTML, or manually. */
async function handleGoogleCredential(response) {
  const base = (window.ALCHIMIA_CONFIG && window.ALCHIMIA_CONFIG.API_BASE_URL) || "";
  try {
    const res = await fetch(`${base}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await res.json();
    if (data.success) {
      Auth.setUser(data.user);
      showToast(`Welcome, ${data.user.name.split(" ")[0]}!`);
      setTimeout(() => (window.location.href = "index.html"), 900);
    } else {
      throw new Error(data.error || "Login failed");
    }
  } catch (err) {
    // Backend not reachable / not configured yet — decode the token locally
    // so the demo still shows a signed-in state.
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      Auth.setUser({
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      });
      showToast(`Welcome, ${payload.name.split(" ")[0]}! (demo mode — backend not connected)`);
      setTimeout(() => (window.location.href = "index.html"), 1200);
    } catch (e2) {
      showToast("Google sign-in failed. Check console.");
      console.error(err);
    }
  }
}

function initGoogleSignIn(containerId) {
  const clientId = window.ALCHIMIA_CONFIG && window.ALCHIMIA_CONFIG.GOOGLE_CLIENT_ID;
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
    container.innerHTML = `<div class="status-msg error">Google Sign-In not configured yet. Add your GOOGLE_CLIENT_ID in public/js/config.js — see README.md.</div>`;
    return;
  }

  const render = () => {
    if (!window.google || !window.google.accounts) return setTimeout(render, 200);
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential
    });
    google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      width: 320,
      shape: "pill"
    });
  };
  render();
}

document.addEventListener("DOMContentLoaded", Auth.reflectHeader);
