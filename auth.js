document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const panes = document.querySelectorAll(".pane");
  const links = document.querySelectorAll("[data-switch]");
  const forgotForm = document.getElementById("forgotForm");

  // --- Function to show correct pane ---
  function showPane(name) {
    panes.forEach(p => {
      p.hidden = p.dataset.pane !== name;
      p.classList.toggle("active", p.dataset.pane === name);
    });
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  }

  // --- Handle tab click (Sign in / Sign up / Forgot password) ---
  tabs.forEach(tab => {
    tab.addEventListener("click", () => showPane(tab.dataset.tab));
  });

  // --- Handle link-based switch (e.g., "Already have an account?" or "Forgot password?") ---
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showPane(link.dataset.switch);
    });
  });

  // --- Password visibility toggle (👁️ / 🙈) ---
  document.querySelectorAll(".password-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.textContent = isPassword ? "🙈" : "👁️";
    });
  });

  // --- Handle Forgot Password form submission ---
  if (forgotForm) {
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = forgotForm.email.value.trim();

      if (!email) {
        alert("Please enter your email address.");
        return;
      }

      // Simulate sending reset link
      alert(`A password reset link has been sent to ${email}`);
      forgotForm.reset();

      // Optionally, return user to sign-in screen after showing message
      showPane("signin");
    });
  }
});
