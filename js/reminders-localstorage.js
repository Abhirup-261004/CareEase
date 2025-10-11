// File: js/reminders-localstorage.js
(function (window, document) {
  const STORAGE_KEY = 'careease.reminders';

  function loadReminders() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveReminders(reminders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }

  function renderReminders(reminders, listEl) {
    listEl.innerHTML = '';
    if (reminders.length === 0) {
      listEl.innerHTML = '<p>No reminders yet.</p>';
      return;
    }

    reminders.forEach((r, index) => {
      const item = document.createElement('div');
      item.className = 'reminder-item';
      item.innerHTML = `
        <strong>${r.title}</strong> — ${r.datetime || ''}<br>
        <small>${r.note || ''}</small>
        <button data-index="${index}" class="delete-reminder">Delete</button>
      `;
      listEl.appendChild(item);
    });

    document.querySelectorAll('.delete-reminder').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index);
        reminders.splice(idx, 1);
        saveReminders(reminders);
        renderReminders(reminders, listEl);
      };
    });
  }

  function exportReminders(reminders) {
    const blob = new Blob([JSON.stringify(reminders, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'careease-reminders.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importReminders(file, listEl) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        saveReminders(data);
        renderReminders(data, listEl);
        alert('Reminders imported successfully!');
      } catch {
        alert('Invalid JSON file!');
      }
    };
    reader.readAsText(file);
  }

  function clearReminders(listEl) {
    if (confirm('Clear all reminders?')) {
      localStorage.removeItem(STORAGE_KEY);
      renderReminders([], listEl);
    }
  }

  window.ReminderStorage = {
    init: function (formId, listId) {
      const form = document.getElementById(formId);
      const listEl = document.getElementById(listId);
      const exportBtn = document.getElementById('export-reminders');
      const importInput = document.getElementById('import-reminders');
      const clearBtn = document.getElementById('clear-reminders');

      let reminders = loadReminders();
      renderReminders(reminders, listEl);

      form.addEventListener('submit', e => {
        e.preventDefault();
        const title = form.querySelector('[name="title"]').value.trim();
        const datetime = form.querySelector('[name="datetime"]').value;
        const note = form.querySelector('[name="note"]').value.trim();

        if (!title) return alert('Please enter a title!');
        reminders.push({ title, datetime, note });
        saveReminders(reminders);
        renderReminders(reminders, listEl);
        form.reset();
      });

      exportBtn.onclick = () => exportReminders(reminders);
      importInput.onchange = e => importReminders(e.target.files[0], listEl);
      clearBtn.onclick = () => clearReminders(listEl);
    },
  };
})(window, document);
