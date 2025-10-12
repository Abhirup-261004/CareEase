// Contact form validation + demo submit
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
const toast = document.getElementById('toast');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name')||'').trim();
  const email = String(data.get('email')||'').trim();
  const phone = String(data.get('phone')||'').trim();
  const topic = String(data.get('topic')||'').trim();
  const message = String(data.get('message')||'').trim();
  const consent = data.get('consent');

  if (name.length < 2) return statusEl.textContent = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return statusEl.textContent = 'Enter a valid email address.';
  if (!topic) return statusEl.textContent = 'Please select a topic.';
  if (message.length < 10) return statusEl.textContent = 'Message should be at least 10 characters.';
  if (!consent) return statusEl.textContent = 'Please agree so we can contact you back.';

  // Demo success — replace with a real POST to Formspree/Netlify/Firebase
  /* Example (Formspree):
  await fetch('https://formspree.io/f/yourid', {
    method:'POST', headers:{'Accept':'application/json'},
    body: JSON.stringify({ name, email, phone, topic, message })
  });
  */

  statusEl.textContent = '';
  form.reset();
  toast?.classList.add('show');
  setTimeout(() => toast?.classList.remove('show'), 2500);
});

// ====== Unified Active Nav Highlight ======
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = Array.from(document.querySelectorAll("nav.primary a"));
  const mobLinks = Array.from(document.querySelectorAll("#mobnav a"));
  const allLinks = [...navLinks, ...mobLinks];
  const sections = Array.from(document.querySelectorAll("section[id]"));

  function clearActive() {
    allLinks.forEach(link => {
      link.classList.remove("active-link");
      link.removeAttribute("aria-current");
    });
  }

  function activate(link) {
    if (!link) return;
    clearActive();
    link.classList.add("active-link");
    link.setAttribute("aria-current", "page");
  }

  function getCurrentFile() {
    let path = window.location.pathname;
    let file = path.substring(path.lastIndexOf("/") + 1);
    if (file === "") file = "index.html";
    return file;
  }

  function updateActive() {
    const file = getCurrentFile();
    const hash = window.location.hash.replace("#", "");

    // ===== For index.html sections =====
    if (file === "index.html") {
      if (hash) {
        const link = allLinks.find(a =>
          (a.getAttribute("href") || "").includes("#" + hash)
        );
        if (link) return activate(link);
      }

      // Scroll-based highlighting
      const scrollY = window.scrollY + 150;
      let currentSection = null;
      sections.forEach(sec => {
        if (scrollY >= sec.offsetTop) currentSection = sec.id;
      });

      if (currentSection) {
        const link = allLinks.find(a =>
          (a.getAttribute("href") || "").endsWith("#" + currentSection)
        );
        if (link) return activate(link);
      }

      // Default: Features or top section
      const homeLink = allLinks.find(a =>
        (a.getAttribute("href") || "").includes("#features")
      );
      return activate(homeLink);
    }

    // ===== For separate pages =====
    const activeLink = allLinks.find(a => {
      const href = a.getAttribute("href") || "";
      const hrefFile = href.split("/").pop();
      return (
        hrefFile === file ||
        hrefFile === decodeURIComponent(file) ||
        href === file
      );
    });

    if (activeLink) activate(activeLink);
  }

  updateActive();
  window.addEventListener("scroll", updateActive);
  window.addEventListener("hashchange", updateActive);
});

// Typewriter & Scroll Effects for Contact Page
document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector("h1.display");
  if (title) {
    title.setAttribute("data-typewriter", "");
    setTimeout(() => title.classList.add("finished"), 2000);
  }

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".section, [data-reveal]").forEach(el => observer.observe(el));
});
