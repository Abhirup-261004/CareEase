;(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const tabs = $$(".tab");
  const panes = $$(".pane");
  const toast = $("#toast");

  const activate = (key) => {
    const target = (key || "signin").toLowerCase(); // 'signin' | 'signup' | 'forgot'

    tabs.forEach((t) => {
      const on = t.getAttribute("data-tab") === target;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
    });

    panes.forEach((p) => {
      const on = p.getAttribute("data-pane") === target;
      p.toggleAttribute("hidden", !on);
    });

    $(`.pane[data-pane="${target}"] input`)?.focus();

    if (location.hash !== `#${target}`) {
      history.replaceState(null, "", `#${target}`);
    }
  };

  const getInitialTab = () => {
    const fromHash = location.hash?.slice(1);
    if (fromHash && ["signin", "signup", "forgot"].includes(fromHash)) return fromHash;
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("tab");
    if (fromQuery && ["signin", "signup", "forgot"].includes(fromQuery.toLowerCase()))
      return fromQuery.toLowerCase();
    return "signin";
  };

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1600);
  };

  // Events that require DOM
  document.addEventListener("DOMContentLoaded", () => {
    // Tabs
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activate(tab.getAttribute("data-tab")));
    });

    // Init tab + deep-linking
    activate(getInitialTab());
    window.addEventListener("hashchange", () => {
      const h = location.hash?.slice(1);
      if (["signin", "signup", "forgot"].includes(h)) activate(h);
    });

    // Demo submit handlers (fake API + redirect)
    panes.forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const old = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Please wait…";

        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = old;

          const pane = form.getAttribute("data-pane");
          try {
            const fd = new FormData(form);

            if (pane === "signup") {
              const email = String(fd.get("email") || "").trim();
              const name =
                String(fd.get("name") || "").trim() || (email ? email.split("@")[0] : "User");
              if (email) localStorage.setItem("ce_user", JSON.stringify({ email, name }));
              if (!localStorage.getItem("ce_prefs")) {
                localStorage.setItem(
                  "ce_prefs",
                  JSON.stringify({ defaultTime: "08:00", sound: "beep" })
                );
              }
              showToast("Account created ✓");
              window.location.href = "profile.html";
            }

            if (pane === "signin") {
              const email = String(fd.get("email") || "").trim();
              let name = null;
              try {
                name = JSON.parse(localStorage.getItem("ce_user") || "null")?.name || null;
              } catch {}
              if (!name && email) name = email.split("@")[0];
              if (email) localStorage.setItem("ce_user", JSON.stringify({ email, name: name || "User" }));
              if (!localStorage.getItem("ce_prefs")) {
                localStorage.setItem(
                  "ce_prefs",
                  JSON.stringify({ defaultTime: "08:00", sound: "beep" })
                );
              }
              showToast("Signed in ✓");
              window.location.href = "profile.html";
            }

            if (pane === "forgot") {
              showToast("Reset link sent ✓");
            }
          } catch {}
        }, 800);
      });
    });

    // Password visibility toggle
    document.querySelectorAll(".password-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const passwordInput = button.previousElementSibling;
        if (!passwordInput) return;
        if (passwordInput.type === "password") {
          passwordInput.type = "text";
          button.textContent = "🙈";
          button.setAttribute("aria-label", "Hide password");
        } else {
          passwordInput.type = "password";
          button.textContent = "👁️";
          button.setAttribute("aria-label", "Show password");
        }
      });
    });

    // Initial autofocus
    $(".pane:not([hidden]) input")?.focus();
  });
})();

