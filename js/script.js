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
let tabCounter = 1;
let activeTabId = 'tab-1';

function setActiveTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tab = document.querySelector(`.tab[data-id="${tabId}"]`);
    if (tab) {
        tab.classList.add('active');
        activeTabId = tabId;
    } else {
        activeTabId = null;
    }
}

function closeTab(tabId) {
    const tab = document.querySelector(`.tab[data-id="${tabId}"]`);
    if (!tab) return;

    if (tab.classList.contains('active')) {
        const nextTab = tab.nextElementSibling;
        const prevTab = tab.previousElementSibling;
        
        if (nextTab) {
            setActiveTab(nextTab.dataset.id);
        } else if (prevTab) {
            setActiveTab(prevTab.dataset.id);
        } else {
            activeTabId = null;
        }
    }
    tab.remove();
}

function createTab() {
    tabCounter++;
    const tabId = `tab-${Date.now()}`;
    
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

document.getElementById('btn-home').addEventListener('click', () => {
    window.location.href = window.location.pathname;
});

document.getElementById('btn-new-tab').addEventListener('click', () => {
    createTab();
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
    window.location.reload();
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
