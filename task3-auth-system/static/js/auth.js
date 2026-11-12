/**
 * Apex Core Technologies — Authentication & JWT Controller
 * Architecture: Clean ES6 Fetch with Bearer Token Injection
 */

const AUTH_TOKEN_KEY = "apex_auth_jwt_token";

document.addEventListener("DOMContentLoaded", () => {
  initTabSwitching();
  initPasswordRequirementsTracker();
  initRegisterForm();
  initLoginForm();
  initLogout();
  checkExistingSession();
});

function initTabSwitching() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      document.querySelectorAll(".auth-tab-panel").forEach((panel) => {
        panel.classList.remove("is-active");
      });
      document.getElementById(`${target}Panel`).classList.add("is-active");
      clearBanners();
    });
  });
}

function initPasswordRequirementsTracker() {
  const regPassword = document.getElementById("regPassword");
  if (!regPassword) return;

  const lengthItem = document.getElementById("pwLength");
  const upperItem = document.getElementById("pwUpper");
  const lowerItem = document.getElementById("pwLower");
  const numItem = document.getElementById("pwNumber");

  regPassword.addEventListener("input", () => {
    const val = regPassword.value;
    updatePwItem(lengthItem, val.length >= 8);
    updatePwItem(upperItem, /[A-Z]/.test(val));
    updatePwItem(lowerItem, /[a-z]/.test(val));
    updatePwItem(numItem, /[0-9]/.test(val));
  });
}

function updatePwItem(el, isValid) {
  if (isValid) {
    el.classList.add("is-valid");
    el.innerHTML = `&bull; ${el.textContent.replace(/^[\u2022•\s-]+/, "")}`;
  } else {
    el.classList.remove("is-valid");
  }
}

function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();
    clearBanners();

    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const role = document.getElementById("regRole").value;

    const submitBtn = document.getElementById("registerBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Hashing with Bcrypt & Creating...";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role })
      });
      const data = await res.json();

      if (!data.success) {
        if (data.errors) {
          for (const [field, msg] of Object.entries(data.errors)) {
            showFieldError(`reg${capitalize(field)}`, msg);
          }
        } else {
          showBanner("regBanner", data.error || "Registration failed.", "error");
        }
        return;
      }

      // Save token and load protected dashboard
      sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
      showBanner("regBanner", "Account established successfully with bcrypt cryptographic hashing. Initializing secure dashboard...", "success");
      setTimeout(() => {
        loadProtectedDashboard();
      }, 700);
    } catch (err) {
      showBanner("regBanner", "Network failure connecting to authentication server.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register Enterprise Account";
    }
  });
}

function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearBanners();

    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value;

    const submitBtn = document.getElementById("loginBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying Credentials...";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();

      if (!data.success) {
        showBanner("loginBanner", data.error || "Authentication failed.", "error");
        return;
      }

      sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
      showBanner("loginBanner", "Credentials verified. JWT token issued.", "success");
      setTimeout(() => {
        loadProtectedDashboard();
      }, 500);
    } catch (err) {
      showBanner("loginBanner", "Network error connecting to authentication server.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Authenticate & Obtain JWT";
    }
  });
}

function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore network fail on logout
    }
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    showAuthCards();
    showBanner("loginBanner", "Session cleared. Cryptographic tokens purged from client memory.", "success");
  });
}

async function checkExistingSession() {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return;

  try {
    const res = await fetch("/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      loadProtectedDashboard();
    } else {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function loadProtectedDashboard() {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    showAuthCards();
    return;
  }

  try {
    const res = await fetch("/api/auth/dashboard", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();

    if (!data.success) {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      showAuthCards();
      showBanner("loginBanner", data.error || "Session validation rejected.", "error");
      return;
    }

    // Populate dashboard
    document.getElementById("authContainer").style.display = "none";
    const dashboard = document.getElementById("protectedDashboard");
    dashboard.classList.add("is-active");

    document.getElementById("dashUsername").textContent = data.authenticated_as;
    document.getElementById("dashRole").textContent = data.role;
    document.getElementById("dashStatus").textContent = data.system_status;
    document.getElementById("rawTokenDisplay").textContent = token;

    // Render audit log
    const auditTbody = document.getElementById("auditLogBody");
    auditTbody.innerHTML = data.audit_logs.map((log) => `
      <tr>
        <td style="font-family: var(--font-family-mono); font-size: 0.8rem;">${escapeHtml(log.timestamp)}</td>
        <td style="font-weight: 500;">${escapeHtml(log.event)}</td>
        <td style="font-family: var(--font-family-mono); font-size: 0.8rem; color: var(--color-muted);">${escapeHtml(log.source)}</td>
      </tr>
    `).join("");

  } catch (err) {
    showBanner("loginBanner", "Failed to retrieve protected dashboard payload.", "error");
  }
}

function showAuthCards() {
  document.getElementById("authContainer").style.display = "block";
  document.getElementById("protectedDashboard").classList.remove("is-active");
}

function showBanner(id, msg, type) {
  const banner = document.getElementById(id);
  if (!banner) return;
  banner.className = `feedback-banner feedback-${type} is-visible`;
  banner.textContent = msg;
}

function clearBanners() {
  document.querySelectorAll(".feedback-banner").forEach((b) => {
    b.className = "feedback-banner";
    b.textContent = "";
  });
}

function showFieldError(inputId, msg) {
  const input = document.getElementById(inputId);
  const errEl = document.getElementById(`${inputId}Error`);
  if (input) input.classList.add("is-invalid");
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.add("is-visible");
  }
}

function clearFieldErrors() {
  document.querySelectorAll(".form-control").forEach((input) => input.classList.remove("is-invalid"));
  document.querySelectorAll(".field-err-msg").forEach((err) => {
    err.textContent = "";
    err.classList.remove("is-visible");
  });
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
