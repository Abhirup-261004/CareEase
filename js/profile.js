;(() => {
  const $ = (s, el = document) => el.querySelector(s)
  const toast = $("#toast")

  function showToast(msg) {
    if (!toast) return
    toast.textContent = msg
    toast.classList.add("show")
    setTimeout(() => toast.classList.remove("show"), 1800)
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem("ce_user"))
    } catch {
      return null
    }
  }
  function setUser(u) {
    localStorage.setItem("ce_user", JSON.stringify(u))
  }
  function getPrefs() {
    try {
      return JSON.parse(localStorage.getItem("ce_prefs")) || { defaultTime: "08:00", sound: "beep" }
    } catch {
      return { defaultTime: "08:00", sound: "beep" }
    }
  }
  function setPrefs(p) {
    localStorage.setItem("ce_prefs", JSON.stringify(p))
  }
  function applyThemeLocal(theme) {
    // mirror app.js logic
    if (theme === "light") document.documentElement.style.filter = "invert(1) hue-rotate(180deg)"
    else document.documentElement.style.filter = ""
    localStorage.setItem("ce_theme", theme)
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = $("#profileForm")
    if (!form) return

    // Redirect to sign in if not authenticated
    const user = getUser()
    if (!user) {
      // Preserve intended redirect back to profile after login if desired
      window.location.href = "auth.html#signin"
      return
    }

    // Populate
    const prefs = getPrefs()
    form.elements.name.value = user.name || ""
    form.elements.email.value = user.email || ""
    form.elements.theme.value = localStorage.getItem("ce_theme") || "dark"
    form.elements.defaultTime.value = prefs.defaultTime || "08:00"
    form.elements.sound.value = prefs.sound || "beep"

    form.addEventListener("submit", (e) => {
      e.preventDefault()
      // update user + prefs
      const nextUser = { ...user, name: String(form.elements.name.value || "").trim() || user.name }
      const nextPrefs = {
        defaultTime: form.elements.defaultTime.value || "08:00",
        sound: form.elements.sound.value || "beep",
      }
      setUser(nextUser)
      setPrefs(nextPrefs)

      const chosenTheme = form.elements.theme.value === "light" ? "light" : "dark"
      applyThemeLocal(chosenTheme)

      showToast("Saved ✓")
    })

    $("#resetPrefs")?.addEventListener("click", () => {
      // reset preferences to defaults (does not change email)
      form.elements.theme.value = "dark"
      form.elements.defaultTime.value = "08:00"
      form.elements.sound.value = "beep"
      applyThemeLocal("dark")
      setPrefs({ defaultTime: "08:00", sound: "beep" })
      showToast("Preferences reset")
    })

    $("#signOut")?.addEventListener("click", () => {
      localStorage.removeItem("ce_user")
      showToast("Signed out")
      setTimeout(() => (window.location.href = "index.html"), 300)
    })
  })
})()
