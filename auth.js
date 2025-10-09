// auth.js — tabs + deep-link support
;(() => {
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s))

  const tabs = $$(".tab")
  const panes = $$(".pane")

  const activate = (key) => {
    // normalize key values: 'signin' | 'signup' | 'forgot'
    const target = (key || "signin").toLowerCase()
    tabs.forEach((t) => {
      const on = t.getAttribute("data-tab") === target
      t.classList.toggle("active", on)
      t.setAttribute("aria-selected", String(on))
    })
    panes.forEach((p) => {
      const on = p.getAttribute("data-pane") === target
      p.toggleAttribute("hidden", !on)
    })
    // focus first input of active pane
    $(`.pane[data-pane="${target}"] input`)?.focus()

    // keep URL hash in sync (nice for bookmarking/back)
    if (location.hash !== `#${target}`) {
      history.replaceState(null, "", `#${target}`)
    }
  }

  // Click on tabs
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.getAttribute("data-tab")))
  })

  // Deep-linking: support both #tab and ?tab= query
  const getInitialTab = () => {
    const fromHash = location.hash?.slice(1)
    if (fromHash && ["signin", "signup", "forgot"].includes(fromHash)) return fromHash
    const params = new URLSearchParams(location.search)
    const fromQuery = params.get("tab")
    if (fromQuery && ["signin", "signup", "forgot"].includes(fromQuery.toLowerCase())) return fromQuery.toLowerCase()
    return "signin"
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", () => activate(getInitialTab()))

  // (Optional) react to manual hash changes, e.g., user edits URL
  window.addEventListener("hashchange", () => {
    const h = location.hash?.slice(1)
    if (["signin", "signup", "forgot"].includes(h)) activate(h)
  })

  // Demo submit (simulate server)
  const toast = $("#toast")
  const showToast = (msg) => {
    toast.textContent = msg
    toast.classList.add("show")
    setTimeout(() => toast.classList.remove("show"), 1600)
  }

  panes.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      const btn = form.querySelector('button[type="submit"]')
      const old = btn.textContent
      btn.disabled = true
      btn.textContent = "Please wait…"

      // pretend to call an API
      setTimeout(() => {
        btn.disabled = false
        btn.textContent = old

        const pane = form.getAttribute("data-pane")
        if (pane === "signin") showToast("Signed in ✓")
        if (pane === "signup") showToast("Account created ✓")
        if (pane === "forgot") showToast("Reset link sent ✓")

        try {
          const fd = new FormData(form)
          if (pane === "signup") {
            const email = String(fd.get("email") || "").trim()
            const name = String(fd.get("name") || "").trim() || (email ? email.split("@")[0] : "User")
            if (email) localStorage.setItem("ce_user", JSON.stringify({ email, name }))
            // default prefs if not set
            if (!localStorage.getItem("ce_prefs")) {
              localStorage.setItem("ce_prefs", JSON.stringify({ defaultTime: "08:00", sound: "beep" }))
            }
            window.location.href = "profile.html"
          } else if (pane === "signin") {
            const email = String(fd.get("email") || "").trim()
            let name = null
            try {
              name = JSON.parse(localStorage.getItem("ce_user") || "null")?.name || null
            } catch {}
            if (!name && email) name = email.split("@")[0]
            if (email) localStorage.setItem("ce_user", JSON.stringify({ email, name: name || "User" }))
            if (!localStorage.getItem("ce_prefs")) {
              localStorage.setItem("ce_prefs", JSON.stringify({ defaultTime: "08:00", sound: "beep" }))
            }
            window.location.href = "profile.html"
          }
        } catch {}
      }, 800)
    })
  })

  // Optional: autofocus first field on load
  document.addEventListener('DOMContentLoaded', ()=>{
    $('.pane:not([hidden]) input')?.focus();
  });
})();
// Password visibility toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.password-toggle');
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const passwordInput = button.previousElementSibling;
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        button.textContent = '🙈';
        button.setAttribute('aria-label', 'Hide password');
      } else {
        passwordInput.type = 'password';
        button.textContent = '👁️';
        button.setAttribute('aria-label', 'Show password');
      }
    });
  });
});
  document.addEventListener("DOMContentLoaded", () => {
    $(".pane:not([hidden]) input")?.focus()
  })
})()
