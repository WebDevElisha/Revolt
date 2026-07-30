lucide.createIcons();

function updateTime() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; 
    
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
    clockElement.textContent = timeString;
}
setInterval(updateTime, 1000);
updateTime();

const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const sidebar = document.getElementById('sidebar');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
});
sidebarClose.addEventListener('click', () => {
    sidebar.classList.remove('active');
});

const tabBar = document.getElementById('tab-bar');
const homeView = document.getElementById('home-view');
const viewport = document.getElementById('viewport');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');

let tabCounter = 1;
let activeTabId = 'tab-1';
const tabData = {
    'tab-1': { url: '' }
};

function renderView() {
    const current = tabData[activeTabId];
    if (current && current.url) {
        homeView.classList.add('hidden');
        viewport.classList.remove('hidden');
        if (viewport.src !== current.url) {
            viewport.src = current.url;
        }
        searchInput.value = current.url;
    } else {
        viewport.classList.add('hidden');
        homeView.classList.remove('hidden');
        viewport.src = 'about:blank';
        searchInput.value = '';
    }
}

function setActiveTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tab = document.querySelector(`.tab[data-id="${tabId}"]`);
    if (tab) {
        tab.classList.add('active');
        activeTabId = tabId;
    } else {
        activeTabId = null;
    }
    renderView();
}

function closeTab(tabId) {
    const tab = document.querySelector(`.tab[data-id="${tabId}"]`);
    if (!tab) return;

    delete tabData[tabId];

    if (tab.classList.contains('active')) {
        const nextTab = tab.nextElementSibling;
        const prevTab = tab.previousElementSibling;
        
        if (nextTab) {
            setActiveTab(nextTab.dataset.id);
        } else if (prevTab) {
            setActiveTab(prevTab.dataset.id);
        } else {
            activeTabId = null;
            renderView();
        }
    }
    tab.remove();
}

function createTab(url = '') {
    tabCounter++;
    const tabId = `tab-${Date.now()}`;
    tabData[tabId] = { url };
    
    const tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.dataset.id = tabId;
    
    const titleEl = document.createElement('span');
    titleEl.className = 'tab-title';
    titleEl.textContent = `RT${tabCounter}`;
    
    const closeIcon = document.createElement('i');
    closeIcon.setAttribute('data-lucide', 'x');
    closeIcon.className = 'tab-close';
    
    tabEl.appendChild(titleEl);
    tabEl.appendChild(closeIcon);
    tabBar.appendChild(tabEl);
    
    lucide.createIcons({ root: tabEl });
    setActiveTab(tabId);
}

tabBar.addEventListener('click', (e) => {
    const tabEl = e.target.closest('.tab');
    if (!tabEl) return;
    
    const closeBtn = e.target.closest('.tab-close');
    if (closeBtn) {
        closeTab(tabEl.dataset.id);
    } else {
        setActiveTab(tabEl.dataset.id);
    }
});

function loadUrlInActiveTab(targetUrl) {
    let finalUrl = targetUrl.trim();
    if (!finalUrl) return;

    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.endsWith('.html')) {
        if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
            finalUrl = 'https://' + finalUrl;
        } else {
            finalUrl = 'https://duckduckgo.com/?q=' + encodeURIComponent(finalUrl);
        }
    }

    if (!activeTabId) {
        createTab(finalUrl);
    } else {
        tabData[activeTabId].url = finalUrl;
        renderView();
    }
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadUrlInActiveTab(searchInput.value);
});

document.querySelectorAll('.app-item').forEach(item => {
    item.addEventListener('click', () => {
        const appName = item.querySelector('.app-name').textContent.trim();
        if (appName === 'AI') {
            loadUrlInActiveTab('html/AI.html');
        }
    });
});

document.getElementById('btn-home').addEventListener('click', () => {
    if (activeTabId) {
        tabData[activeTabId].url = '';
        renderView();
    }
    sidebar.classList.remove('active');
});

document.getElementById('btn-new-tab').addEventListener('click', () => {
    createTab('');
    sidebar.classList.remove('active');
});

document.getElementById('btn-close-tab').addEventListener('click', () => {
    if (activeTabId) {
        closeTab(activeTabId);
    }
    sidebar.classList.remove('active');
});

document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
    sidebar.classList.remove('active');
});

document.getElementById('btn-reload').addEventListener('click', () => {
    if (activeTabId && tabData[activeTabId].url) {
        viewport.src = tabData[activeTabId].url;
    } else {
        window.location.reload();
    }
    sidebar.classList.remove('active');
});

particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 95,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#ffffff"
    },
    "shape": {
      "type": "circle"
    },
    "opacity": {
      "value": 0.8,
      "random": true,
      "anim": {
        "enable": false
      }
    },
    "size": {
      "value": 3.5,
      "random": true,
      "anim": {
        "enable": false
      }
    },
    "line_linked": {
      "enable": false
    },
    "move": {
      "enable": true,
      "speed": 1.2,
      "direction": "bottom",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": false
      },
      "onclick": {
        "enable": false
      },
      "resize": true
    }
  },
  "retina_detect": true
});
