// language manager - handles switching languages and translating content
// loads translations from json files and updates page text

class LanguageManager {
  constructor() {
    this.currentLang = localStorage.getItem('careease_lang') || 'en';
    this.translations = {};
    this.init();
  }

  // load translations for current language
  async init() {
    try {
      const response = await fetch(`/lang/${this.currentLang}.json`);
      this.translations = await response.json();
      this.applyTranslations();
      this.setupLanguageSelector();
    } catch (err) {
      console.log('failed to load translations:', err);
    }
  }

  // translate a key like "contact.title"
  t(key) {
    const keys = key.split('.');
    let value = this.translations;

    for (let k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // return key if translation not found
      }
    }

    return value || key;
  }

  // apply translations to page - finds all elements with data-i18n attribute
  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) {
          el.placeholder = translation;
        } else {
          el.value = translation;
        }
      } else {
        el.textContent = translation;
      }
    });

    // also update page direction and language
    document.documentElement.lang = this.currentLang;
    if (this.currentLang === 'hi') {
      document.documentElement.dir = 'ltr';
    }
  }

  // set up language dropdown selector
  setupLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;

    selector.value = this.currentLang;
    selector.addEventListener('change', (e) => {
      this.switchLanguage(e.target.value);
    });
  }

  // switch to a different language
  switchLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('careease_lang', lang);

    // reload translations
    this.init();

    // show feedback message
    const message = lang === 'hi' ? 'भाषा बदल दी गई' : 'Language changed';
    this.showMessage(message);
  }

  // show temporary message
  showMessage(text) {
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  }

  // get current language
  getLang() {
    return this.currentLang;
  }

  // check if language is hindi
  isHindi() {
    return this.currentLang === 'hi';
  }
}

// initialize language manager when DOM is ready
let i18n = null;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    i18n = new LanguageManager();
  });
} else {
  i18n = new LanguageManager();
}

// export for global use
window.i18n = i18n;
