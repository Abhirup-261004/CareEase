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
      return JSON.parse(localStorage.getItem("ce_prefs")) || { defaultTime: "08:00", sound: "beep", notifications: {} }
    } catch {
      return { defaultTime: "08:00", sound: "beep", notifications: {} }
    }
  }
  function setPrefs(p) {
    localStorage.setItem("ce_prefs", JSON.stringify(p))
  }

  function applyThemeLocal(theme) {
    if (theme === "light") document.documentElement.style.filter = "invert(1) hue-rotate(180deg)"
    else document.documentElement.style.filter = ""
    localStorage.setItem("ce_theme", theme)
  }

  document.addEventListener("DOMContentLoaded", () => {
    const DEV_MODE = true // Set to false in production
    const form = $("#profileForm")
    if (!form) return

    // Get current user
    let user = getUser()

    // Developer mode: create fake user for testing
    if (!user && DEV_MODE) {
      user = { name: "Test User", email: "test@example.com" }
      localStorage.setItem("ce_user", JSON.stringify(user))
    }

    // Redirect to sign in if not authenticated
    if (!user) {
      window.location.href = "auth.html#signin"
      return
    }

    // Populate profile fields
    const prefs = getPrefs()
    form.elements.name.value = user.name || ""
    form.elements.email.value = user.email || ""
    form.elements.theme.value = localStorage.getItem("ce_theme") || "dark"
    form.elements.defaultTime.value = prefs.defaultTime || "08:00"
    form.elements.sound.value = prefs.sound || "beep"

    // Populate notification preferences
    const notifPrefs = prefs.notifications || {}
    $("#emailNotif")?.checked = notifPrefs.email || false
    $("#pushNotif")?.checked = notifPrefs.push || false
    $("#soundNotif")?.checked = notifPrefs.sound || false
    $("#vibrateNotif")?.checked = notifPrefs.vibrate || false

    // Handle profile form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      const nextUser = { ...user, name: String(form.elements.name.value || "").trim() || user.name }
      const nextPrefs = {
        defaultTime: form.elements.defaultTime.value || "08:00",
        sound: form.elements.sound.value || "beep",
        notifications: {
          email: $("#emailNotif")?.checked || false,
          push: $("#pushNotif")?.checked || false,
          sound: $("#soundNotif")?.checked || false,
          vibrate: $("#vibrateNotif")?.checked || false
        }
      }
      setUser(nextUser)
      setPrefs(nextPrefs)

      const chosenTheme = form.elements.theme.value === "light" ? "light" : "dark"
      applyThemeLocal(chosenTheme)

      showToast("Saved ✓")
    })

    // Reset preferences
    $("#resetPrefs")?.addEventListener("click", () => {
      form.elements.theme.value = "dark"
      form.elements.defaultTime.value = "08:00"
      form.elements.sound.value = "beep"
      applyThemeLocal("dark")

      $("#emailNotif")?.checked = false
      $("#pushNotif")?.checked = false
      $("#soundNotif")?.checked = false
      $("#vibrateNotif")?.checked = false

      setPrefs({ defaultTime: "08:00", sound: "beep", notifications: {} })
      showToast("Preferences reset")
    })

    // Sign out
    $("#signOut")?.addEventListener("click", () => {
      localStorage.removeItem("ce_user")
      showToast("Signed out")
      setTimeout(() => (window.location.href = "index.html"), 300)
    })

    // Save Notification Preferences separately
    $("#saveNotif")?.addEventListener("click", () => {
      const currentPrefs = getPrefs()
      currentPrefs.notifications = {
        email: $("#emailNotif")?.checked || false,
        push: $("#pushNotif")?.checked || false,
        sound: $("#soundNotif")?.checked || false,
        vibrate: $("#vibrateNotif")?.checked || false
      }
      setPrefs(currentPrefs)
      showToast("Notification preferences saved ✓")
    })
  })
})()
