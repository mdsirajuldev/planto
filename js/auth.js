/* =========================================================================
   auth.js — login, register, password strength, reset, verification, logout
   Frontend simulation only: no backend, session kept in localStorage.
   ========================================================================= */
(function () {
  "use strict";
  const P = (window.PLANTO = window.PLANTO || {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function strength(value) {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  }

  function initMeter() {
    $$("[data-strength]").forEach((input) => {
      const bar = $("#" + input.dataset.strength + " span");
      const label = $("#" + input.dataset.strength + "-label");
      input.addEventListener("input", () => {
        const s = strength(input.value);
        const colors = ["var(--c-danger)", "var(--c-danger)", "var(--c-warning)", "var(--c-accent)", "var(--c-success)"];
        const words = ["Too short", "Weak", "Fair", "Strong", "Excellent"];
        if (bar) { bar.style.width = s * 25 + "%"; bar.style.background = colors[s]; }
        if (label) { label.textContent = words[s]; label.style.color = colors[s]; }
      });
    });
  }

  function initLogin() {
    const form = $("#login-form");
    if (!form) return;
    const remembered = P.store.get("remember", "");
    if (remembered) { $("#login-email").value = remembered; $("#remember-me").checked = true; }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!P.validate(form)) { $("#login-error").classList.remove("hidden"); return; }
      $("#login-error").classList.add("hidden");
      const email = $("#login-email").value.trim();
      P.store.set("remember", $("#remember-me").checked ? email : "");
      P.store.set("user", { name: email.split("@")[0].replace(/\W/g, " "), email });
      $("#login-success").classList.remove("hidden");
      P.toast("Welcome back to Planto.");
      setTimeout(() => (location.href = "dashboard.html"), 800);
    });
  }

  function initRegister() {
    const form = $("#register-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!P.validate(form) || !$("#agree").checked) {
        $("#register-error").classList.remove("hidden");
        return;
      }
      $("#register-error").classList.add("hidden");
      P.store.set("user", { name: $("#reg-name").value.trim(), email: $("#reg-email").value.trim() });
      $("#register-success").classList.remove("hidden");
      P.toast("Account created. Check your inbox to verify.");
      setTimeout(() => (location.href = "dashboard.html"), 1000);
    });
  }

  function initOtp() {
    const row = $(".otp-row");
    if (!row) return;
    const inputs = $$("input", row);
    inputs.forEach((input, i) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 1);
        if (input.value && inputs[i + 1]) inputs[i + 1].focus();
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && inputs[i - 1]) inputs[i - 1].focus();
      });
    });
  }

  function initLogout() {
    $$("[data-logout]").forEach((btn) => btn.addEventListener("click", (e) => {
      e.preventDefault();
      P.store.set("user", null);
      P.toast("You have been signed out.", "fa-right-from-bracket");
      setTimeout(() => (location.href = "login.html"), 600);
    }));
  }

  document.addEventListener("planto:ready", () => { initMeter(); initLogin(); initRegister(); initOtp(); initLogout(); });
})();
