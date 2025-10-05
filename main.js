
const text = document.getElementById('md');
const svg = document.getElementById('mindmap');
const tabsEl = document.getElementById('tabs');
const addBtn = document.getElementById('addTab');

let mm = null;
let currentTab = null;

const STORAGE_TABS = "markmap-tabs";

function storageKey(tabId) {
    return "markmap-md-" + tabId;
}

function save(tabId, value) {
    localStorage.setItem(storageKey(tabId), value);
}

function load(tabId) {
    return localStorage.getItem(storageKey(tabId));
}

function saveTabs(tabs) {
    localStorage.setItem(STORAGE_TABS, JSON.stringify(tabs));
}

function loadTabs() {
    const saved = localStorage.getItem(STORAGE_TABS);
    return saved ? JSON.parse(saved) : [];
}

function render() {
    const data = markmap.transform(text.value);
    if (!mm) {
        mm = markmap.Markmap.create(svg, null, data);
    } else {
        mm.setData(data);
        mm.fit();
    }
    if (currentTab) {
        save(currentTab, text.value);
    }
}

function switchTab(tabId) {
    if (currentTab) {
        save(currentTab, text.value);
    }
    currentTab = tabId;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[data-id="${tabId}"]`).classList.add('active');

    const saved = load(tabId);
    text.value = saved || `# ${tabId}\n\n- new note`;
    render();
}

function deleteTab(tabId) {
    let tabs = loadTabs();
    if (tabs.length <= 1) {
        return;
    }
    localStorage.removeItem(storageKey(tabId));
    tabs = tabs.filter(t => t.id !== tabId);
    saveTabs(tabs);

    const tabEl = document.querySelector(`.tab[data-id="${tabId}"]`);
    if (tabEl) tabEl.remove();

    if (currentTab === tabId) {
        if (tabs.length > 0) {
            switchTab(tabs[0].id);
        } else {
            text.value = "";
            svg.innerHTML = "";
            currentTab = null;
        }
    }

    updateCloseButtons();
}

function createTab(name) {
    const tabId = "tab-" + Date.now();

    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.id = tabId;

    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.textContent = name;
    btn.dataset.id = tabId;
    btn.addEventListener("click", () => switchTab(tabId));

    const close = document.createElement("button");
    close.className = "close-btn";
    close.textContent = "×";
    close.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTab(tabId);
    });

    tab.appendChild(btn);
    tab.appendChild(close);
    tabsEl.insertBefore(tab, addBtn);

    const tabs = loadTabs();
    tabs.push({ id: tabId, name });
    saveTabs(tabs);

    switchTab(tabId);
    updateCloseButtons();
}

function updateCloseButtons() {
    const tabs = loadTabs();
    const closeBtns = document.querySelectorAll('.close-btn');
    if (tabs.length <= 1) {
        closeBtns.forEach(btn => btn.style.display = "none");
    } else {
        closeBtns.forEach(btn => btn.style.display = "inline");
    }
}

function init() {
    const tabs = loadTabs();
    if (tabs.length === 0) {
        createTab("Tab 1");
    } else {
        tabs.forEach(tabData => {
            const tab = document.createElement("div");
            tab.className = "tab";
            tab.dataset.id = tabData.id;

            const btn = document.createElement("button");
            btn.className = "tab-btn";
            btn.textContent = tabData.name;
            btn.dataset.id = tabData.id;
            btn.addEventListener("click", () => switchTab(tabData.id));

            const close = document.createElement("button");
            close.className = "close-btn";
            close.textContent = "×";
            close.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteTab(tabData.id);
            });

            tab.appendChild(btn);
            tab.appendChild(close);
            tabsEl.insertBefore(tab, addBtn);
        });
        switchTab(tabs[0].id);
        updateCloseButtons();
    }
}

text.addEventListener('input', render);
addBtn.addEventListener('click', () => {
    const name = prompt("新しいタブの名前を入力:", "New Tab");
    if (name) createTab(name);
});

init();
