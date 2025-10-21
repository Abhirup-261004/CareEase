// pwa registration and management
// registers the service worker and handles app installation prompts

let deferredPrompt = null;

// register service worker when DOM is ready
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('service worker registered');

        // check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              showUpdateNotification();
            }
          });
        });
      })
      .catch((err) => {
        console.log('service worker registration failed:', err);
      });
  });
}

// show notification when app is updated
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');
  notification.className = 'pwa-update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <span>✨ A new version of CareEase is available!</span>
      <button class="update-btn" onclick="window.location.reload()">Refresh Now</button>
    </div>
  `;

  // add styles if not already present
  if (!document.getElementById('pwa-styles')) {
    const style = document.createElement('style');
    style.id = 'pwa-styles';
    style.textContent = `
      .pwa-update-notification {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 16px;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideUp 0.3s ease-out;
      }

      .update-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .update-btn {
        background: white;
        color: #667eea;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .update-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @media (max-width: 600px) {
        .update-content {
          flex-direction: column;
        }

        .pwa-update-notification {
          padding: 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);
}

// handle app installation prompt
window.addEventListener('beforeinstallprompt', (e) => {
  // prevent the mini-infobar from appearing
  e.preventDefault();
  // store the event for later use
  deferredPrompt = e;

  // show our custom install button
  showInstallPrompt();
});

// show custom install button/prompt
function showInstallPrompt() {
  const installBtn = document.getElementById('installApp');
  if (installBtn && deferredPrompt) {
    installBtn.style.display = 'block';
    installBtn.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('user installed the app');
        }
        deferredPrompt = null;
        installBtn.style.display = 'none';
      });
    });
  }
}

// app installed
window.addEventListener('appinstalled', () => {
  console.log('pwa was installed');
  const installBtn = document.getElementById('installApp');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
});

// detect online/offline status
window.addEventListener('online', () => {
  console.log('back online');
  showStatusMessage('✓ You\'re back online!', 'success');
});

window.addEventListener('offline', () => {
  console.log('went offline');
  showStatusMessage('📡 You\'re offline - cached data available', 'warning');
});

// show status message
function showStatusMessage(message, type = 'info') {
  const msg = document.createElement('div');
  msg.textContent = message;
  msg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
    color: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  `;

  // add animation
  if (!document.getElementById('status-animation')) {
    const style = document.createElement('style');
    style.id = 'status-animation';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// periodic background sync for reminders (future enhancement)
if ('periodicSync' in ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.periodicSync.register('sync-reminders', {
      minInterval: 24 * 60 * 60 * 1000 // once a day
    }).catch((err) => {
      console.log('periodic sync registration failed:', err);
    });
  });
}

// allow app to handle links without opening browser
if ('launchQueue' in window) {
  window.launchQueue.setConsumer((launchParams) => {
    if (launchParams.files && launchParams.files.length > 0) {
      console.log('app launched with file:', launchParams.files[0]);
    }
  });
}
