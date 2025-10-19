const addressForm = document.getElementById('address-form');
const addressInput = document.getElementById('address-input');
const webview = document.getElementById('browser-view');
const homeScreen = document.getElementById('home-screen');
const navButtons = {
  back: document.querySelector('[data-action="back"]'),
  forward: document.querySelector('[data-action="forward"]'),
  reload: document.querySelector('[data-action="reload"]'),
  home: document.querySelector('[data-action="home"]')
};
const windowButtons = document.querySelectorAll('.window-button');
const quickLaunchers = document.querySelectorAll('[data-url]');
const browserArea = document.querySelector('.browser-area');
const toolbar = document.querySelector('.toolbar');

const loadingBar = document.createElement('div');
loadingBar.className = 'loading-bar';
browserArea.appendChild(loadingBar);

let homeVisible = true;

const toNavigableURL = (value) => {
  if (!value) return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    if (!parsed.protocol) {
      throw new Error('Missing protocol');
    }
    return parsed.toString();
  } catch (error) {
    const looksLikeDomain = /\./.test(trimmed) && !/\s/.test(trimmed);
    if (looksLikeDomain) {
      return `https://${trimmed}`;
    }
    const encoded = encodeURIComponent(trimmed);
    return `https://www.google.com/search?q=${encoded}`;
  }
};

const updateNavigationState = () => {
  if (!webview || homeVisible) {
    navButtons.back.disabled = true;
    navButtons.forward.disabled = true;
    navButtons.reload.disabled = true;
    return;
  }

  navButtons.back.disabled = !webview.canGoBack();
  navButtons.forward.disabled = !webview.canGoForward();
  navButtons.reload.disabled = false;
};

const setHomeVisible = (visible) => {
  homeVisible = visible;
  if (visible) {
    homeScreen.classList.remove('hidden');
    webview.classList.remove('visible');
    webview.src = 'about:blank';
    addressInput.value = '';
    document.title = 'Nebula GX';
  } else {
    homeScreen.classList.add('hidden');
    webview.classList.add('visible');
  }
  updateNavigationState();
};

const showLoading = (progress) => {
  if (progress === 1) {
    loadingBar.classList.remove('active');
    loadingBar.style.transform = 'scaleX(0)';
    return;
  }
  loadingBar.classList.add('active');
  const scaled = Math.max(progress, 0.08);
  loadingBar.style.transform = `scaleX(${scaled})`;
};

const navigateTo = (value) => {
  const target = toNavigableURL(value);
  if (!target) return;

  if (homeVisible) {
    setHomeVisible(false);
  }

  if (webview.getURL() === target) {
    webview.reload();
    return;
  }

  webview.src = target;
};

addressForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  navigateTo(addressInput.value);
});

Object.entries(navButtons).forEach(([key, button]) => {
  if (!button) return;

  button.addEventListener('click', () => {
    switch (key) {
      case 'back':
        if (webview.canGoBack()) {
          webview.goBack();
        }
        break;
      case 'forward':
        if (webview.canGoForward()) {
          webview.goForward();
        }
        break;
      case 'reload':
        if (!homeVisible) {
          webview.reload();
        }
        break;
      case 'home':
        setHomeVisible(true);
        break;
      default:
        break;
    }
  });
});

quickLaunchers.forEach((launcher) => {
  const openLink = () => {
    const url = launcher.dataset.url;
    if (url) {
      navigateTo(url);
    }
  };

  launcher.addEventListener('click', openLink);

  if (launcher.tagName !== 'BUTTON') {
    launcher.setAttribute('role', launcher.getAttribute('role') || 'button');
    launcher.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLink();
      }
    });
  }
});

if (window.electronAPI?.onWindowState) {
  window.electronAPI.onWindowState((state) => {
    const maximizeButton = document.querySelector('[data-window="maximize"]');
    if (maximizeButton) {
      maximizeButton.classList.toggle('active', state === 'maximized');
    }
  });
}

toolbar?.addEventListener('dblclick', () => {
  window.electronAPI?.windowControl('maximize');
});

windowButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.window;
    if (action) {
      window.electronAPI?.windowControl(action);
    }
  });
});

if (webview) {
  webview.addEventListener('did-start-loading', () => {
    showLoading(0.1);
    updateNavigationState();
  });

  webview.addEventListener('did-stop-loading', () => {
    showLoading(1);
    updateNavigationState();
  });

  webview.addEventListener('did-finish-load', () => {
    showLoading(1);
    updateNavigationState();
    if (!homeVisible) {
      addressInput.value = webview.getURL();
    }
  });

  webview.addEventListener('did-fail-load', () => {
    showLoading(1);
  });

  webview.addEventListener('did-navigate', (event) => {
    if (homeVisible) {
      setHomeVisible(false);
    }
    addressInput.value = event.url;
    updateNavigationState();
  });

  webview.addEventListener('did-navigate-in-page', (event) => {
    addressInput.value = event.url;
    updateNavigationState();
  });

  webview.addEventListener('will-navigate', (event) => {
    if (homeVisible) {
      setHomeVisible(false);
    }
    addressInput.value = event.url;
  });

  webview.addEventListener('new-window', (event) => {
    event.preventDefault();
    if (event.url) {
      window.electronAPI?.openExternal(event.url);
    }
  });

  webview.addEventListener('page-title-updated', (event) => {
    if (!homeVisible && event.title) {
      document.title = `${event.title} – Nebula GX`;
    }
  });
}

updateNavigationState();
