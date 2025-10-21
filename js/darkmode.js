// Dark mode handler - toggles between light and dark themes
// saves user preference to localStorage so it persists

class ThemeManager {
  constructor() {
    this.storageKey = 'ce_theme';
    this.darkClass = 'dark-mode';
    this.lightClass = 'light-mode';
    
    this.setup();
  }

  setup() {
    // load existing theme or use default
    let savedTheme = localStorage.getItem(this.storageKey);
    if (!savedTheme) {
      savedTheme = 'dark'; // default theme
    }
    
    this.setTheme(savedTheme);
    this.bindButtons();
  }

  setTheme(theme) {
    const root = document.documentElement;
    
    // remove both classes first
    root.classList.remove(this.darkClass);
    root.classList.remove(this.lightClass);
    
    // add the right one
    if (theme === 'dark') {
      root.classList.add(this.darkClass);
    } else {
      root.classList.add(this.lightClass);
    }
    
    // remember choice
    localStorage.setItem(this.storageKey, theme);
    
    // update button text on all toggle buttons
    this.updateButtons(theme);
  }

  updateButtons(currentTheme) {
    const toggles = document.querySelectorAll('[id$="themeToggle"]');
    
    toggles.forEach(btn => {
      if (currentTheme === 'dark') {
        btn.textContent = '☀️ Light';
        btn.setAttribute('aria-pressed', 'false');
      } else {
        btn.textContent = '🌙 Dark';
        btn.setAttribute('aria-pressed', 'true');
      }
    });
  }

  toggle() {
    const current = localStorage.getItem(this.storageKey) || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  bindButtons() {
    // find all theme toggle buttons
    const toggleBtn = document.getElementById('themeToggle');
    const toggleMobileBtn = document.getElementById('themeToggleMobile');
    
    // add click handler
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggle();
      });
    }
    
    if (toggleMobileBtn) {
      toggleMobileBtn.addEventListener('click', () => {
        this.toggle();
      });
    }
  }
}

// start theme manager when page loads
let themeManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
  });
} else {
  // if page is already loaded, start immediately
  themeManager = new ThemeManager();
}
