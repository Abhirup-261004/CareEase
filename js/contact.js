// contact form validation and submission handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = document.getElementById('formStatus');
  const toast = document.getElementById('toast');

  // set up form validation on this form
  const validator = new FormValidator(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // validate all fields first
    if (!validator.validateAll()) {
      statusEl.textContent = 'Please fix the errors above';
      return;
    }

    // get form data
    const formData = new FormData(form);
    const data = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      topic: formData.get('topic').trim(),
      message: formData.get('message').trim(),
      consent: formData.get('consent')
    };

    try {
      statusEl.textContent = 'Sending...';

      // replace this with your actual backend endpoint
      // for now just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      // clear form and show success
      statusEl.textContent = 'Message sent! We\'ll get back to you soon.';
      statusEl.style.color = '#16a34a';
      form.reset();
      validator.setupListeners(); // reset validation state

      // show toast notification
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }

      // reset message after a few seconds
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.style.color = '';
      }, 3000);

    } catch (err) {
      statusEl.textContent = 'Failed to send. Please try again.';
      statusEl.style.color = '#dc2626';
      console.error('Form submission error:', err);
    }
  });

  // reset form clears validation errors too
  form.addEventListener('reset', () => {
    setTimeout(() => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => validator.clearFieldError(input));
      statusEl.textContent = '';
      statusEl.style.color = '';
    }, 0);
  });
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
