// ================== Mobile nav toggle ==================
const menuBtn = document.getElementById('menuBtn');
const mobnav = document.getElementById('mobnav');
if (menuBtn && mobnav) {
  menuBtn.addEventListener('click', () => {
    const open = !mobnav.hasAttribute('hidden');
    if (open) {
      mobnav.setAttribute('hidden', '');
      menuBtn.setAttribute('aria-expanded', 'false');
    } else {
      mobnav.removeAttribute('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
    }
  });
}

// ================== Theme toggle (persist in localStorage) ==================
const themeToggle = document.getElementById('themeToggle');
const applyTheme = t => {
  if (t === 'light') document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
  else document.documentElement.style.filter = '';
  localStorage.setItem('ce_theme', t);
  themeToggle?.setAttribute('aria-pressed', String(t === 'light'));
};
const saved = localStorage.getItem('ce_theme');
if (saved) applyTheme(saved);

themeToggle?.addEventListener('click', () => {
  const cur = localStorage.getItem('ce_theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});

// ================== Back to Top Button ==================
const backToTop = document.getElementById("backToTop");
if (backToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) backToTop.classList.add("visible");
    else backToTop.classList.remove("visible");
  });

  backToTop.addEventListener("click", e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ================== Beta form (demo) ==================
const betaForm = document.getElementById('betaForm');
const betaStatus = document.getElementById('betaStatus');
betaForm?.addEventListener('submit', e => {
  e.preventDefault();
  const email = new FormData(betaForm).get('email');
  if (!email) return;
  betaStatus.textContent = "Thanks! We'll email your invite soon.";
  betaForm.reset();
});

// ================== Video modal (lightweight) ==================
const openVideo = document.getElementById('openVideo');
openVideo?.addEventListener('click', () => {
  const wrap = document.createElement('div');
  Object.assign(wrap.style, { 
    position:'fixed', inset:'0', background:'rgba(0,0,0,0.6)', 
    backdropFilter:'blur(6px)', display:'grid', placeItems:'center', zIndex:'100' 
  });

  const card = document.createElement('div');
  Object.assign(card.style, { 
    width:'min(900px, 92vw)', aspectRatio:'16/9', background:'black', 
    borderRadius:'16px', overflow:'hidden', boxShadow:'var(--shadow)' 
  });
  card.innerHTML = '<video controls autoplay style="width:100%;height:100%"><source src="" type="video/mp4">Your browser does not support the video tag.</video>';

  const close = document.createElement('button');
  close.textContent = "✕";
  close.className = "btn btn-ghost";
  Object.assign(close.style, { position: "absolute", top: "18px", right: "18px" });
  close.addEventListener('click', () => wrap.remove());

  wrap.appendChild(card);
  wrap.appendChild(close);
  document.body.appendChild(wrap);
});

// ================== Auth-aware navbar ==================
function getUser() {
  try { return JSON.parse(localStorage.getItem("ce_user")); }
  catch { return null; }
}

function makeProfileLink() {
  const a = document.createElement("a");
  a.href = "profile.html";
  a.className = "btn btn-primary hero-cta";
  a.textContent = "Profile";
  a.setAttribute("aria-label", "Profile");
  return a;
}

function makeGetStartedLink() {
  const a = document.createElement("a");
  a.href = "auth.html#signin";
  a.className = "btn btn-primary hero-cta";
  a.textContent = "Get Started";
  a.setAttribute("aria-label", "Get Started");
  return a;
}

function replaceAuthLink(container) {
  if (!container) return;
  const user = getUser();
  const authLink = container.querySelector('a[href^="auth.html"]');
  const profileLink = container.querySelector('a[href="profile.html"]');

  if (user) {
    if (!profileLink) {
      const link = makeProfileLink();
      if (authLink) authLink.replaceWith(link);
      else container.appendChild(link);
    }
    container.querySelectorAll('a[href^="auth.html"]').forEach(n => n.remove());
  } else {
    if (!authLink) {
      const link = makeGetStartedLink();
      if (profileLink) profileLink.replaceWith(link);
      else container.appendChild(link);
    }
    container.querySelectorAll('a[href="profile.html"]').forEach(n => n.remove());
  }
}

function refreshAuthUI() {
  document.querySelectorAll("nav.primary").forEach(nav => replaceAuthLink(nav));
  document.querySelectorAll("#mobnav .mobmenu").forEach(menu => replaceAuthLink(menu));
}

// ================== Sticky navbar shadow on scroll ==================
const navbar = document.querySelector('nav.primary');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Navbar shadow on scroll
const topbar = document.querySelector('.topbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    topbar.classList.add('scrolled');
  } else {
    topbar.classList.remove('scrolled');
  }
});


// ================== Scroll highlight + smooth scroll ==================
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("nav.primary a");
  const mobLinks = document.querySelectorAll("#mobnav a");
  const sections = document.querySelectorAll("section[id]");
  const scrollOffset = 100;

  function setActiveLink() {
    const scrollPos = window.scrollY + 150;
    let currentSectionId = "";
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) currentSectionId = section.id;
    });

    [navLinks, mobLinks].forEach(links => {
      links.forEach(link => {
        const href = link.getAttribute("href");
        if (href.endsWith(`#${currentSectionId}`)) link.classList.add("active");
        else link.classList.remove("active");
      });
    });
  }

  window.addEventListener("scroll", setActiveLink);
  setActiveLink();

  [...navLinks, ...mobLinks].forEach(link => {
    link.addEventListener("click", e => {
      const targetId = link.getAttribute("href").split("#")[1];
      if (targetId && document.getElementById(targetId)) {
        e.preventDefault();
        const targetPos = document.getElementById(targetId).offsetTop - scrollOffset;
        window.scrollTo({ top: targetPos, behavior: "smooth" });
      }
    });
  });

  refreshAuthUI();

  // ================== Typewriter for tagline ==================
  const taglineEl = document.getElementById('tagline');
  if (taglineEl) {
    const text = taglineEl.textContent;
    taglineEl.textContent = '';
    let i = 0;
    function typeWriter() {
      if (i < text.length) {
        taglineEl.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 30);
      }
    }
    typeWriter();
  }

  // ================== Feature card animation ==================
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    featureCards.forEach(card => observer.observe(card));
  }

  // ================== Section fade-in animation ==================
  const sectionsFade = document.querySelectorAll(".section");
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  sectionsFade.forEach(section => sectionObserver.observe(section));
});

window.addEventListener("storage", e => {
  if (["ce_user"].includes(e.key)) refreshAuthUI();
});




// Testimonials fade-in animation
const testimonials = document.querySelectorAll('.testi-card');

const testiObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        testiObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

testimonials.forEach(card => testiObserver.observe(card));

featureCards.forEach((card) => observer.observe(card))

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll("[data-typewriter]");

  elements.forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    el.style.width = "0ch";

    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        el.classList.add("finished"); // removes cursor
      }
    }, 50); // typing speed
  });
});
