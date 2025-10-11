const $$ = sel => document.querySelector(sel);
const $all = sel => Array.from(document.querySelectorAll(sel));

const STORE_KEY = 'ce_reminders';
const MISSED_KEY = 'ce_missed';

const state = {
  reminders: [],
  missed: [],
  timerId: null,
  ringingId: null,
  ringStopper: null, // function to stop sound
};

function loadState() {
  try {
    state.reminders = JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    state.missed = JSON.parse(localStorage.getItem(MISSED_KEY)) || [];
  } catch {
    state.reminders = [];
    state.missed = [];
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.reminders));
  localStorage.setItem(MISSED_KEY, JSON.stringify(state.missed));
}

// ---------- UI ----------
const form = $$('#reminderForm');
const list = $$('#list');
const emptyState = $$('#emptyState');
const missedList = $$('#missedList');
const missedEmpty = $$('#missedEmpty');
const toast = $$('#toast');

function uid() {
  return 'r_' + Math.random().toString(36).slice(2, 9);
}

function fmtTime(t24) {
  const [h, m] = t24.split(':').map(Number);
  const am = h < 12;
  const h12 = ((h + 11) % 12) + 1;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

function chipForType(type) {
  const map = { medicine: '💊', vitals: '🩺', appointment: '📅', other: '⏰' };
  return `<span class="badge" style="width:auto;padding:0 10px">${map[type] || '⏰'}</span>`;
}

function render() {
  const q = ($$('#search')?.value || '').toLowerCase();
  const data = state.reminders
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
    .filter(r => r.title.toLowerCase().includes(q));

  list.innerHTML = data
    .map(
      r => `
      <div class="step" data-id="${r.id}">
        ${chipForType(r.type)}
        <div style="flex:1">
          <b>${r.title}</b>
          <div class="muted">${r.repeat.toUpperCase()} • ${fmtTime(r.time)}${r.notes ? ` • ${r.notes}` : ''}</div>
        </div>
        <label class="muted" title="Enable/disable" style="display:flex;align-items:center;gap:8px">
          <input type="checkbox" class="toggle" ${r.enabled ? 'checked' : ''}/>
          <span>${r.enabled ? 'On' : 'Off'}</span>
        </label>
        <button class="btn btn-outline edit">Edit</button>
        <button class="btn btn-ghost delete">Delete</button>
      </div>`
    )
    .join('');

  emptyState.style.display = data.length ? 'none' : 'block';

  missedList.innerHTML = state.missed
    .slice()
    .reverse()
    .map(
      m => `
      <div class="step" data-id="${m.id}">
        <span class="badge" style="width:auto;padding:0 10px">⚠</span>
        <div style="flex:1">
          <b>Missed: ${m.title}</b>
          <div class="muted">${m.when} • ${m.reason || ''}</div>
        </div>
        <button class="btn btn-primary renotify" data-target="${m.sourceId}">Re-notify</button>
        <button class="btn btn-ghost clearMissed">Clear</button>
      </div>`
    )
    .join('');

  missedEmpty.style.display = state.missed.length ? 'none' : 'block';
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ---------- CRUD ----------
function upsertReminder(payload) {
  const idx = state.reminders.findIndex(r => r.id === payload.id);
  if (idx >= 0) state.reminders[idx] = { ...state.reminders[idx], ...payload };
  else state.reminders.push(payload);
  saveState();
  render();
}

function deleteReminder(id) {
  state.reminders = state.reminders.filter(r => r.id !== id);
  saveState();
  render();
}

// ---------- Scheduling ----------
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function nextFireDate(rem) {
  const now = new Date();
  const [hh, mm] = rem.time.split(':').map(Number);
  const base = new Date();
  base.setHours(hh, mm, 0, 0);

  if (rem.repeat === 'once') return base;

  if (rem.repeat === 'daily') {
    if (now <= base) return base;
    const d = new Date(base);
    d.setDate(d.getDate() + 1);
    return d;
  }

  if (rem.repeat === 'weekly') {
    const last = rem.lastFired ? new Date(rem.lastFired) : null;
    if (!last) {
      if (now <= base) return base;
      const d = new Date(base);
      d.setDate(d.getDate() + 7);
      return d;
    } else {
      const d = new Date(last);
      d.setDate(d.getDate() + 7);
      d.setHours(hh, mm, 0, 0);
      return d;
    }
  }
  return base;
}

function withinSameMinute(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate() &&
    a.getHours() === b.getHours() &&
    a.getMinutes() === b.getMinutes()
  );
}

function logMissed(r, reason = 'Not acknowledged') {
  state.missed.push({
    id: 'm_' + Math.random().toString(36).slice(2, 9),
    sourceId: r.id,
    title: r.title,
    when: new Date().toLocaleString(),
    reason,
  });
  saveState();
  render();
}

// Gentle alert
function startBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();

    let on = false;
    const iv = setInterval(() => {
      on = !on;
      g.gain.exponentialRampToValueAtTime(on ? 0.08 : 0.0001, ctx.currentTime + 0.05);
    }, 800);

    const stop = () => {
      clearInterval(iv);
      o.stop();
      ctx.close();
    };
    return stop;
  } catch {
    return () => {};
  }
}

function ring(rem) {
  if (state.ringingId) return;
  state.ringingId = rem.id;
  state.ringStopper = startBell();
  showToast(`🔔 ${rem.title} — it’s time!`);

  setTimeout(() => {
    if (state.ringingId === rem.id) {
      stopRing();
      logMissed(rem, 'No response (30s)');
    }
  }, 30000);
}

function stopRing() {
  state.ringStopper?.();
  state.ringingId = null;
  state.ringStopper = null;
}

function acknowledge(rem) {
  stopRing();
  rem.lastFired = new Date().toISOString();
  saveState();
  render();
}

function tick() {
  const now = new Date();
  state.reminders.forEach(rem => {
    if (!rem.enabled) return;
    const due = nextFireDate(rem);
    if (withinSameMinute(due, now)) {
      const justFired = rem.lastFired && withinSameMinute(new Date(rem.lastFired), now);
      if (!justFired) ring(rem);
    }
  });
}

// ---------- Events ----------
form?.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(form);
  const id = fd.get('id') || uid();
  const payload = {
    id,
    type: fd.get('type'),
    title: String(fd.get('title')).trim(),
    time: fd.get('time'),
    repeat: fd.get('repeat'),
    notes: String(fd.get('notes') || ''),
    enabled: fd.get('enabled') ? true : false,
    lastFired: null,
    createdAt: new Date().toISOString(),
  };
  if (!payload.title || !payload.time) return;
  upsertReminder(payload);
  form.reset();
  showToast('Saved ✔');
});

$$('#formReset')?.addEventListener('click', () => {
  form.reset();
  form.querySelector('[name=id]').value = '';
});

list?.addEventListener('click', e => {
  const step = e.target.closest('.step');
  if (!step) return;
  const id = step.dataset.id;
  const r = state.reminders.find(x => x.id === id);
  if (!r) return;

  if (e.target.classList.contains('delete')) {
    deleteReminder(id);
    showToast('Deleted');
  } else if (e.target.classList.contains('edit')) {
    form.elements.id.value = r.id;
    form.elements.type.value = r.type;
    form.elements.title.value = r.title;
    form.elements.time.value = r.time;
    form.elements.repeat.value = r.repeat;
    form.elements.notes.value = r.notes || '';
    form.elements.enabled.checked = !!r.enabled;
    window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  } else if (e.target.classList.contains('toggle')) {
    r.enabled = e.target.checked;
    saveState();
    render();
  }
});

$$('#testBell')?.addEventListener('click', () => {
  ring({ id: 'test', title: 'Test reminder' });
  setTimeout(() => stopRing(), 2500);
});

$$('#search')?.addEventListener('input', render);

missedList?.addEventListener('click', e => {
  const row = e.target.closest('.step');
  if (!row) return;
  if (e.target.classList.contains('renotify')) {
    const id = e.target.getAttribute('data-target');
    const r = state.reminders.find(x => x.id === id);
    if (!r) return;
    ring(r);
  } else if (e.target.classList.contains('clearMissed')) {
    const idx = state.missed.findIndex(x => x.id === row.dataset.id);
    if (idx >= 0) {
      state.missed.splice(idx, 1);
      saveState();
      render();
    }
  }
});

toast?.addEventListener('click', () => {
  const r = state.reminders.find(x => x.id === state.ringingId);
  if (r) acknowledge(r);
});

// ---------- Init ----------
loadState();
render();

(function startScheduler() {
  const now = new Date();
  const msToNextHalfMinute = 1000 * (30 - (now.getSeconds() % 30));
  setTimeout(() => {
    tick();
    state.timerId = setInterval(tick, 30000);
  }, msToNextHalfMinute);
})();

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

    if (file === "index.html") {
      if (hash) {
        const link = allLinks.find(a => (a.getAttribute("href") || "").includes("#" + hash));
        if (link) return activate(link);
      }

      const scrollY = window.scrollY + 150;
      let currentSection = null;
      sections.forEach(sec => {
        if (scrollY >= sec.offsetTop) currentSection = sec.id;
      });
      if (currentSection) {
        const link = allLinks.find(a => (a.getAttribute("href") || "").endsWith("#" + currentSection));
        if (link) return activate(link);
      }

      const homeLink = allLinks.find(a => (a.getAttribute("href") || "").includes("#features"));
      return activate(homeLink);
    }

    const activeLink = allLinks.find(a => {
      const href = a.getAttribute("href") || "";
      const hrefFile = href.split("/").pop();
      return hrefFile === file || hrefFile === decodeURIComponent(file) || href === file;
    });
    if (activeLink) activate(activeLink);
  }

  updateActive();
  window.addEventListener("scroll", updateActive);
  window.addEventListener("hashchange", updateActive);
});
