// js/auth.js  — Auth frontend con JWT + sessionStorage
// Compatible con el backend Node/Express/MySQL de FocusLab

const API = "";          // vacío = mismo origen (proxy via Express o servidor)
const TOKEN_KEY  = "focus_token";
const USER_KEY   = "focus_user";

/* ── Helpers ──────────────────────────────────────────── */
function getToken()  { return sessionStorage.getItem(TOKEN_KEY); }
function getUser()   {
    const u = sessionStorage.getItem(USER_KEY);
    try { return u ? JSON.parse(u) : null; } catch { return null; }
}
function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}

/* ── Proteger página (llamar al inicio de páginas privadas) */
function requireAuth() {
    if (!getToken()) {
        window.location.href = "login.html";
    }
}

/* ── Logout ──────────────────────────────────────────── */
function logout() {
    clearSession();
    window.location.href = "login.html";
}

/* ── REGISTRO ────────────────────────────────────────── */
(function initRegister() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name     = (document.getElementById("regUser")?.value  || "").trim();
        const email    = (document.getElementById("regEmail")?.value || "").trim();
        const password = (document.getElementById("regPass")?.value  || "");
        const errEl    = document.getElementById("errorMsg");

        // Validación básica
        if (!name || !email || !password) {
            if (errEl) { errEl.textContent = "Completa todos los campos"; errEl.classList.add("show"); }
            return;
        }
        if (password.length < 8) {
            if (errEl) { errEl.textContent = "La contraseña debe tener al menos 8 caracteres"; errEl.classList.add("show"); }
            return;
        }

        const btn = document.getElementById("submitBtn");
        if (btn) { btn.disabled = true; btn.classList.add("loading"); }
        if (errEl) errEl.classList.remove("show");

        try {
            const res  = await fetch("/api/auth/register", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (!res.ok || data.error) {
                if (errEl) { errEl.textContent = data.error || "Error al registrar"; errEl.classList.add("show"); }
            } else {
                alert("¡Cuenta creada! Ahora inicia sesión 🚀");
                window.location.href = "login.html";
            }
        } catch (err) {
            if (errEl) { errEl.textContent = "Error de conexión con el servidor"; errEl.classList.add("show"); }
        } finally {
            if (btn) { btn.disabled = false; btn.classList.remove("loading"); }
        }
    });
})();

/* ── LOGIN ───────────────────────────────────────────── */
(async function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    // Si ya tiene sesión, redirige directo
    if (getToken()) { window.location.href = "index.html"; return; }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email    = (document.getElementById("loginUser")?.value || "").trim();
        const password = (document.getElementById("loginPass")?.value || "");
        const errEl    = document.getElementById("errorMsg");

        if (!email || !password) {
            if (errEl) { errEl.textContent = "Completa todos los campos"; errEl.classList.add("show"); }
            return;
        }
        if (errEl) errEl.classList.remove("show");

        try {
            const res  = await fetch("/api/auth/login", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok || data.error) {
                if (errEl) { errEl.textContent = data.error || "Credenciales incorrectas"; errEl.classList.add("show"); }
                return;
            }

            sessionStorage.setItem(TOKEN_KEY, data.token);
            sessionStorage.setItem(USER_KEY,  JSON.stringify(data.user));

            window.location.href = "index.html";
        } catch (err) {
            if (errEl) { errEl.textContent = "Error de conexión con el servidor"; errEl.classList.add("show"); }
        }
    });
})();