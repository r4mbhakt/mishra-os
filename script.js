
/*********************************
  OS STATE (PERSISTENT)
*********************************/
const OS_STATE = {
  openApps: [],
  focusedApp: null,
  notesData: ""
};

function saveState() {
  localStorage.setItem("mishra_os_state", JSON.stringify(OS_STATE));
}

function loadState() {
  const data = localStorage.getItem("mishra_os_state");
  if (!data) return;
  const parsed = JSON.parse(data);

  OS_STATE.openApps = parsed.openApps || [];
  OS_STATE.focusedApp = parsed.focusedApp || null;
  OS_STATE.notesData = parsed.notesData || "";
}
/*********************************
  GLOBAL STATE (FAANG STYLE)
*********************************/
let focusedWindow = null;
const WINDOW_STATE = {};



/*********************************
  CLOCKS (TOP + TASKBAR)
*********************************/
setInterval(() => {
  const time = new Date().toLocaleTimeString();
  const clockTop = document.getElementById("clock");
  const clockTask = document.getElementById("task-clock");

  if (clockTop) clockTop.innerText = time;
  if (clockTask) clockTask.innerText = time;
}, 1000);


/*********************************
  WINDOW CORE + FOCUS + MINIMIZE
*********************************/
function createWindow(title, content, appId) {

  const existing = document.querySelector(`.window[data-app="${appId}"]`);
  if (existing) {
    existing.style.display = "block";
    focusWindow(existing);
    return;
  }

  const win = document.createElement("div");
  win.className = "window";
  win.dataset.app = appId;
  win.style.zIndex = Date.now();

  win.innerHTML = `
  <div class="window-header">
    <span>${title}</span>
    <div>
      <button class="min-btn">—</button>
      <button class="max-btn">⬜</button>
      <span class="close">✖</span>
    </div>
  </div>
  <div class="window-body">${content}</div>
`;


  document.getElementById("desktop").appendChild(win);
  dragWindow(win);
  addTaskbarIcon(appId, title, win);
  focusWindow(win);

  // close
  win.querySelector(".close").onclick = () => {
  removeTaskbarIcon(appId);
  OS_STATE.openApps = OS_STATE.openApps.filter(a => a !== appId);
  if (OS_STATE.focusedApp === appId) OS_STATE.focusedApp = null;
  saveState();
  win.remove();
};

  // minimize
  win.querySelector(".min-btn").onclick = () => {
    win.style.display = "none";
  };
  // initial state
WINDOW_STATE[appId] = {
  isMaximized: false,
  prev: {}
};

const maxBtn = win.querySelector(".max-btn");

// maximize / restore button
maxBtn.onclick = () => toggleMaximize(win, appId);

// double click header = maximize
win.querySelector(".window-header").ondblclick = () => {
  toggleMaximize(win, appId);
};


  // focus on click
  win.addEventListener("mousedown", () => {
    focusWindow(win);
  });
  if (!OS_STATE.openApps.includes(appId)) {
  OS_STATE.openApps.push(appId);
  saveState();
}

OS_STATE.focusedApp = appId;
saveState();
}


/*********************************
  WINDOW FOCUS HANDLER
*********************************/
function focusWindow(win) {
  if (focusedWindow) {
    focusedWindow.classList.remove("active-window");
  }

  focusedWindow = win;
  win.classList.add("active-window");
  win.style.zIndex = Date.now();
}


/*********************************
  TASKBAR
*********************************/
function addTaskbarIcon(appId, title, win) {
  if (document.getElementById("task-" + appId)) return;

  const btn = document.createElement("button");
  btn.id = "task-" + appId;
  btn.className = "task-icon";
  btn.innerText = title;

  btn.onclick = () => {
    if (win.style.display === "none") {
      win.style.display = "block";
      focusWindow(win);
    } else {
      win.style.display = "none";
    }
  };

  document.getElementById("task-apps").appendChild(btn);
}

function removeTaskbarIcon(appId) {
  const btn = document.getElementById("task-" + appId);
  if (btn) btn.remove();
}


/*********************************
  APPS
*********************************/
function openTerminal() {
  closeMenus();
  createWindow(
    "Terminal",
    `
    root@mishra-os:~$
    <input style="width:90%;background:black;color:#00ff9c;border:none"
      onkeydown="if(event.key==='Enter'){this.value=''}">
    `,
    "terminal"
  );
}
function openMishraSearch() {
  closeMenus();
  createWindow(
    "Mishra Search",
    `
    <div style="height:400px">
      <script async src="https://cse.google.com/cse.js?cx=321a98194b4554868"></script>
      <div class="gcse-search"></div>

    </div>
    `,
    "mishra-search"
  );
}


function openNotes() {
  closeMenus();
  createWindow(
    "Notes",
    `<textarea id="notesArea"
      style="width:100%;height:220px;background:black;color:#00ff9c">
      ${OS_STATE.notesData || ""}
     </textarea>`,
    "notes"
  );

  setTimeout(() => {
    const area = document.getElementById("notesArea");
    if (!area) return;

    area.addEventListener("input", () => {
      OS_STATE.notesData = area.value;
      saveState();
    });
  }, 0);
}



function openCalculator() {
  closeMenus();
  createWindow(
    "Calculator",
    `
    <input id="calcDisplay" disabled
      style="width:100%;height:40px;background:black;color:#00ff9c;margin-bottom:10px">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">
      <button onclick="calc('7')">7</button>
      <button onclick="calc('8')">8</button>
      <button onclick="calc('9')">9</button>
      <button onclick="calc('/')">÷</button>

      <button onclick="calc('4')">4</button>
      <button onclick="calc('5')">5</button>
      <button onclick="calc('6')">6</button>
      <button onclick="calc('*')">×</button>

      <button onclick="calc('1')">1</button>
      <button onclick="calc('2')">2</button>
      <button onclick="calc('3')">3</button>
      <button onclick="calc('-')">−</button>

      <button onclick="calc('0')">0</button>
      <button onclick="calc('.')">.</button>
      <button onclick="calculate()">=</button>
      <button onclick="calc('+')">+</button>
    </div>
    `,
    "calculator"
  );
}

function openFiles() {
  closeMenus();
  createWindow("Files", "<p>File system ready</p>", "files");
}

function openGallery() {
  closeMenus();
  createWindow("Gallery", "<p>Gallery ready</p>", "gallery");
}


/*********************************
  CALCULATOR LOGIC
*********************************/
function calc(v) {
  const d = document.getElementById("calcDisplay");
  if (d) d.value += v;
}

function calculate() {
  const d = document.getElementById("calcDisplay");
  try {
    d.value = eval(d.value);
  } catch {
    d.value = "Error";
  }
}
function toggleMaximize(win, appId) {
  const state = WINDOW_STATE[appId];

  if (!state.isMaximized) {
    // save old position
    state.prev = {
      top: win.style.top,
      left: win.style.left,
      width: win.style.width,
      height: win.style.height
    };

    win.style.top = "35px";        // below topbar
    win.style.left = "0";
    win.style.width = "100%";
    win.style.height = "calc(100% - 75px)"; // topbar + taskbar

    state.isMaximized = true;
  } else {
    // restore
    win.style.top = state.prev.top;
    win.style.left = state.prev.left;
    win.style.width = state.prev.width;
    win.style.height = state.prev.height;

    state.isMaximized = false;
  }

  focusWindow(win);
}



/*********************************
  DRAG WINDOW
*********************************/
function dragWindow(win) {
    const appId = win.dataset.app;

  const header = win.querySelector(".window-header");
  let x = 0, y = 0, down = false;

  header.onmousedown = e => {
    if (WINDOW_STATE[appId]?.isMaximized) return;
    down = true;
    x = e.clientX - win.offsetLeft;
    y = e.clientY - win.offsetTop;
    focusWindow(win);
  };

  document.onmousemove = e => {
    if (!down) return;
    win.style.left = e.clientX - x + "px";
    win.style.top = e.clientY - y + "px";
  };

  document.onmouseup = () => down = false;
}


/*********************************
  START MENU + SEARCH (STABLE)
*********************************/
document.addEventListener("DOMContentLoaded", () => {

  const startBtn = document.getElementById("start-btn");
  const startMenu = document.getElementById("start-menu");
  const searchBtn = document.getElementById("search-btn");
  const searchMenu = document.getElementById("search-menu");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  const apps = [
    { name: "terminal", action: openTerminal },
    { name: "files", action: openFiles },
    { name: "notes", action: openNotes },
    { name: "gallery", action: openGallery },
    { name: "calculator", action: openCalculator }
  ];

  startBtn.onclick = e => {
    e.stopPropagation();
    startMenu.classList.toggle("hidden");
    searchMenu.classList.add("hidden");
  };

  searchBtn.onclick = e => {
    e.stopPropagation();
    searchMenu.classList.toggle("hidden");
    startMenu.classList.add("hidden");
    searchInput.value = "";
    searchResults.innerHTML = "";
    searchInput.focus();
    selectedIndex = -1;

  };

  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = "";
    if (!q) return;

    const matched = apps.filter(a => a.name.includes(q));
    matched.forEach(a => {
      const div = document.createElement("div");
      div.className = "search-item";
      div.innerText = a.name;
      div.onclick = () => {
        searchMenu.classList.add("hidden");
        a.action();
      };
      searchResults.appendChild(div);
    });
  };
  let selectedIndex = -1;

searchInput.addEventListener("keydown", e => {
  const items = document.querySelectorAll(".search-item");
  if (!items.length) return;

  // Arrow Down
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % items.length;
    updateSelection(items);
  }

  // Arrow Up
  if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex =
      (selectedIndex - 1 + items.length) % items.length;
    updateSelection(items);
  }

  // Enter
  if (e.key === "Enter") {
    e.preventDefault();
    if (selectedIndex >= 0) {
      items[selectedIndex].click();
    }
  }

  // Escape
  if (e.key === "Escape") {
    searchMenu.classList.add("hidden");
  }
});

function updateSelection(items) {
  items.forEach(i => i.classList.remove("active-search"));
  if (items[selectedIndex]) {
    items[selectedIndex].classList.add("active-search");
  }
}


  document.body.addEventListener("click", () => {
    startMenu.classList.add("hidden");
    searchMenu.classList.add("hidden");
  });

  startMenu.addEventListener("click", e => e.stopPropagation());
  searchMenu.addEventListener("click", e => e.stopPropagation());
});


/*********************************
  UTILITY
*********************************/
function closeMenus() {
  document.getElementById("start-menu")?.classList.add("hidden");
  document.getElementById("search-menu")?.classList.add("hidden");
}
/*********************************
  OS RESTORE ON LOAD
*********************************/
document.addEventListener("DOMContentLoaded", () => {
  loadState();

  OS_STATE.openApps.forEach(app => {
    if (app === "terminal") openTerminal();
    if (app === "notes") openNotes();
    if (app === "calculator") openCalculator();
    if (app === "files") openFiles();
    if (app === "gallery") openGallery();
  });
});
// BATTERY STATUS
if ("getBattery" in navigator) {
  navigator.getBattery().then(battery => {
    function updateBattery() {
      const level = Math.round(battery.level * 100);
      document.getElementById("battery").innerText = `🔋 ${level}%`;
    }
    updateBattery();
    battery.addEventListener("levelchange", updateBattery);
  });
} else {
  document.getElementById("battery").innerText = "🔋 N/A";
}
function updateNetwork() {
  const net = document.getElementById("network");
  if (navigator.onLine) {
    net.innerText = "📶 Online";
  } else {
    net.innerText = "📶 Offline";
  }
}

window.addEventListener("online", updateNetwork);
window.addEventListener("offline", updateNetwork);
updateNetwork();
let volumeLevel = 100;

document.getElementById("sound").onclick = () => {
  volumeLevel -= 25;
  if (volumeLevel < 0) volumeLevel = 100;
  document.getElementById("sound").innerText = `🔊 ${volumeLevel}%`;
};
