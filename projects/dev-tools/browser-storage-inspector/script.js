const storageState = {
  local: [],
  session: [],
  cookies: [],
  indexed: [],
  databases: [],
  selectedDb: "",
  selectedStore: "",
};

const elements = {
  searchInput: document.getElementById("searchInput"),
  refreshBtn: document.getElementById("refreshBtn"),
  seedBtn: document.getElementById("seedBtn"),
  exportAllBtn: document.getElementById("exportAllBtn"),
  loadIndexedBtn: document.getElementById("loadIndexedBtn"),
  deleteDbBtn: document.getElementById("deleteDbBtn"),
  dbSelect: document.getElementById("dbSelect"),
  storeSelect: document.getElementById("storeSelect"),
  statusMessage: document.getElementById("statusMessage"),
  counts: {
    local: document.getElementById("localCount"),
    session: document.getElementById("sessionCount"),
    cookies: document.getElementById("cookieCount"),
    indexed: document.getElementById("indexedCount"),
  },
  rows: {
    local: document.getElementById("localRows"),
    session: document.getElementById("sessionRows"),
    cookies: document.getElementById("cookieRows"),
    indexed: document.getElementById("indexedRows"),
  },
};

document.addEventListener("DOMContentLoaded", initializeInspector);

function initializeInspector() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => showPanel(tab.dataset.panel));
  });

  document.querySelectorAll("[data-form]").forEach((form) => {
    form.addEventListener("submit", handleFormSubmit);
  });

  document.querySelectorAll("[data-clear]").forEach((button) => {
    button.addEventListener("click", () => clearStorage(button.dataset.clear));
  });

  elements.refreshBtn.addEventListener("click", refreshAll);
  elements.seedBtn.addEventListener("click", seedDemoData);
  elements.exportAllBtn.addEventListener("click", exportAllData);
  elements.loadIndexedBtn.addEventListener("click", refreshIndexedDB);
  elements.deleteDbBtn.addEventListener("click", deleteSelectedDatabase);
  elements.searchInput.addEventListener("input", renderAll);
  elements.dbSelect.addEventListener("change", handleDatabaseChange);
  elements.storeSelect.addEventListener("change", handleStoreChange);

  refreshAll();
}

async function refreshAll() {
  readLocalStorage();
  readSessionStorage();
  readCookies();
  await refreshIndexedDB();
  renderAll();
  setStatus("Storage data refreshed.");
}

function readLocalStorage() {
  storageState.local = readWebStorage(localStorage);
}

function readSessionStorage() {
  storageState.session = readWebStorage(sessionStorage);
}

function readWebStorage(storage) {
  return Array.from({ length: storage.length }, (_, index) => {
    const key = storage.key(index);
    return {
      key,
      value: storage.getItem(key),
    };
  }).sort(sortByKey);
}

function readCookies() {
  storageState.cookies = document.cookie
    ? document.cookie.split(";").map((cookie) => {
        const separatorIndex = cookie.indexOf("=");
        const name = decodeURIComponent(cookie.slice(0, separatorIndex).trim());
        const value = decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
        return { key: name, value };
      }).sort(sortByKey)
    : [];
}

async function refreshIndexedDB() {
  if (!("indexedDB" in window)) {
    storageState.indexed = [];
    setStatus("IndexedDB is not available in this browser.");
    return;
  }

  if (typeof indexedDB.databases !== "function") {
    storageState.indexed = [];
    populateDatabaseSelect();
    setStatus("This browser does not expose IndexedDB database listing. Try Seed Demo Data.");
    return;
  }

  const databases = await indexedDB.databases();
  storageState.databases = databases
    .filter((database) => database.name)
    .map((database) => ({
      name: database.name,
      version: database.version || 1,
      stores: [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  storageState.indexed = [];

  for (const database of storageState.databases) {
    try {
      const db = await openDatabase(database.name);
      database.stores = Array.from(db.objectStoreNames);

      for (const storeName of database.stores) {
        const records = await readObjectStore(db, storeName);
        records.forEach((record) => {
          storageState.indexed.push({
            database: database.name,
            store: storeName,
            key: record.key,
            value: record.value,
          });
        });
      }

      db.close();
    } catch (error) {
      storageState.indexed.push({
        database: database.name,
        store: "unavailable",
        key: "error",
        value: error.message,
      });
    }
  }

  preserveIndexedSelection();
  populateDatabaseSelect();
}

function openDatabase(name) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onerror = () => reject(request.error || new Error("Could not open database."));
    request.onsuccess = () => resolve(request.result);
  });
}

function readObjectStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.openCursor();
    const records = [];

    request.onerror = () => reject(request.error || new Error("Could not read object store."));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(records);
        return;
      }

      records.push({
        key: cursor.primaryKey,
        value: cursor.value,
      });
      cursor.continue();
    };
  });
}

function populateDatabaseSelect() {
  const options = storageState.databases.map((database) => {
    return `<option value="${escapeHtml(database.name)}">${escapeHtml(database.name)}</option>`;
  });

  elements.dbSelect.innerHTML = options.length
    ? options.join("")
    : '<option value="">No databases found</option>';

  if (storageState.selectedDb) {
    elements.dbSelect.value = storageState.selectedDb;
  }

  populateStoreSelect();
}

function populateStoreSelect() {
  const database = storageState.databases.find((item) => item.name === elements.dbSelect.value);
  const stores = database ? database.stores : [];

  elements.storeSelect.innerHTML = stores.length
    ? stores.map((store) => `<option value="${escapeHtml(store)}">${escapeHtml(store)}</option>`).join("")
    : '<option value="">No object stores found</option>';

  if (storageState.selectedStore) {
    elements.storeSelect.value = storageState.selectedStore;
  }
}

function preserveIndexedSelection() {
  const previousDb = storageState.selectedDb || elements.dbSelect.value;
  const previousStore = storageState.selectedStore || elements.storeSelect.value;
  const firstDb = storageState.databases[0];

  storageState.selectedDb = storageState.databases.some((db) => db.name === previousDb)
    ? previousDb
    : firstDb?.name || "";

  const selectedDatabase = storageState.databases.find((db) => db.name === storageState.selectedDb);
  storageState.selectedStore = selectedDatabase?.stores.includes(previousStore)
    ? previousStore
    : selectedDatabase?.stores[0] || "";
}

function handleDatabaseChange() {
  storageState.selectedDb = elements.dbSelect.value;
  storageState.selectedStore = "";
  populateStoreSelect();
  renderAll();
}

function handleStoreChange() {
  storageState.selectedStore = elements.storeSelect.value;
  renderAll();
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const type = form.dataset.form;
  const formData = new FormData(form);
  const key = String(formData.get("key") || "").trim();
  const value = String(formData.get("value") || "");

  if (type === "local") {
    localStorage.setItem(key, value);
    readLocalStorage();
  }

  if (type === "session") {
    sessionStorage.setItem(key, value);
    readSessionStorage();
  }

  if (type === "cookies") {
    const maxAge = Number(formData.get("maxAge")) || 86400;
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    readCookies();
  }

  if (type === "indexed") {
    const saved = await saveIndexedRecord(key, value);
    if (!saved) {
      return;
    }
    await refreshIndexedDB();
  }

  form.reset();
  renderAll();
  setStatus(`${labelFor(type)} entry saved.`);
}

async function saveIndexedRecord(key, value) {
  const dbName = elements.dbSelect.value;
  const storeName = elements.storeSelect.value;

  if (!dbName || !storeName) {
    setStatus("Select an IndexedDB database and object store before saving.");
    return;
  }

  let parsedValue;
  try {
    parsedValue = JSON.parse(value);
  } catch (error) {
    setStatus("IndexedDB values must be valid JSON.");
    return;
  }

  try {
    const db = await openDatabase(dbName);
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const parsedKey = key ? parseIndexedKey(key) : undefined;
      const request = store.keyPath
        ? store.put(parsedValue)
        : parsedKey === undefined
          ? store.put(parsedValue)
          : store.put(parsedValue, parsedKey);

      request.onerror = () => reject(request.error || new Error("Could not save IndexedDB record."));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed."));
    });
    db.close();
    return true;
  } catch (error) {
    setStatus(`IndexedDB save failed: ${error.message}`);
    return false;
  }
}

function parseIndexedKey(key) {
  try {
    return JSON.parse(key);
  } catch (error) {
    return key;
  }
}

async function clearStorage(type) {
  if (type === "local") {
    localStorage.clear();
    readLocalStorage();
  }

  if (type === "session") {
    sessionStorage.clear();
    readSessionStorage();
  }

  if (type === "cookies") {
    storageState.cookies.forEach((cookie) => deleteCookie(cookie.key));
    readCookies();
  }

  renderAll();
  setStatus(`${labelFor(type)} cleared.`);
}

async function deleteEntry(type, key, metadata = {}) {
  if (type === "local") {
    localStorage.removeItem(key);
    readLocalStorage();
  }

  if (type === "session") {
    sessionStorage.removeItem(key);
    readSessionStorage();
  }

  if (type === "cookies") {
    deleteCookie(key);
    readCookies();
  }

  if (type === "indexed") {
    await deleteIndexedRecord(metadata.database, metadata.store, key);
    await refreshIndexedDB();
  }

  renderAll();
  setStatus(`${labelFor(type)} entry deleted.`);
}

function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

async function deleteIndexedRecord(dbName, storeName, key) {
  const db = await openDatabase(dbName);
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error || new Error("Could not delete IndexedDB record."));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed."));
  });
  db.close();
}

async function deleteSelectedDatabase() {
  const dbName = elements.dbSelect.value;
  if (!dbName) {
    setStatus("No IndexedDB database selected.");
    return;
  }

  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onerror = () => reject(request.error || new Error("Could not delete database."));
    request.onsuccess = () => resolve();
    request.onblocked = () => setStatus("Close other tabs using this database, then try again.");
  });

  storageState.selectedDb = "";
  storageState.selectedStore = "";
  await refreshIndexedDB();
  renderAll();
  setStatus(`IndexedDB database "${dbName}" deleted.`);
}

function editEntry(type, key, value) {
  const form = document.querySelector(`[data-form="${type}"]`);
  form.elements.key.value = key;
  form.elements.value.value = stringifyValue(value);

  if (type === "cookies" && form.elements.maxAge) {
    form.elements.maxAge.value = 86400;
  }

  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderAll() {
  const query = elements.searchInput.value.trim().toLowerCase();

  renderKeyValueRows("local", filterEntries(storageState.local, query));
  renderKeyValueRows("session", filterEntries(storageState.session, query));
  renderKeyValueRows("cookies", filterEntries(storageState.cookies, query));
  renderIndexedRows(filterIndexedEntries(storageState.indexed, query));

  elements.counts.local.textContent = storageState.local.length;
  elements.counts.session.textContent = storageState.session.length;
  elements.counts.cookies.textContent = storageState.cookies.length;
  elements.counts.indexed.textContent = storageState.indexed.length;
}

function renderKeyValueRows(type, entries) {
  elements.rows[type].innerHTML = "";

  if (!entries.length) {
    renderEmptyRow(elements.rows[type], 3, `No ${labelFor(type)} entries found.`);
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="key-cell">${escapeHtml(entry.key)}</td>
      <td class="value-cell">${escapeHtml(entry.value)}</td>
      <td>
        <div class="row-actions">
          <button class="secondary" type="button" data-action="edit">Edit</button>
          <button class="secondary" type="button" data-action="export">Export</button>
          <button class="danger" type="button" data-action="delete">Delete</button>
        </div>
      </td>
    `;

    row.querySelector('[data-action="edit"]').addEventListener("click", () => {
      editEntry(type, entry.key, entry.value);
    });
    row.querySelector('[data-action="export"]').addEventListener("click", () => {
      downloadJson(`${type}-${entry.key}.json`, entry);
    });
    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      deleteEntry(type, entry.key);
    });

    elements.rows[type].appendChild(row);
  });
}

function renderIndexedRows(entries) {
  elements.rows.indexed.innerHTML = "";

  const selectedDb = elements.dbSelect.value;
  const selectedStore = elements.storeSelect.value;
  const scopedEntries = entries.filter((entry) => {
    if (!selectedDb || !selectedStore) return true;
    return entry.database === selectedDb && entry.store === selectedStore;
  });

  if (!scopedEntries.length) {
    renderEmptyRow(elements.rows.indexed, 4, "No IndexedDB records found.");
    return;
  }

  scopedEntries.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="key-cell">${escapeHtml(entry.database)} / ${escapeHtml(entry.store)}</td>
      <td class="key-cell">${escapeHtml(stringifyValue(entry.key))}</td>
      <td class="value-cell">${escapeHtml(stringifyValue(entry.value))}</td>
      <td>
        <div class="row-actions">
          <button class="secondary" type="button" data-action="edit">Edit</button>
          <button class="secondary" type="button" data-action="export">Export</button>
          <button class="danger" type="button" data-action="delete">Delete</button>
        </div>
      </td>
    `;

    row.querySelector('[data-action="edit"]').addEventListener("click", () => {
      editEntry("indexed", stringifyValue(entry.key), entry.value);
    });
    row.querySelector('[data-action="export"]').addEventListener("click", () => {
      downloadJson(`indexeddb-${entry.database}-${entry.store}-${stringifyValue(entry.key)}.json`, entry);
    });
    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      deleteEntry("indexed", entry.key, {
        database: entry.database,
        store: entry.store,
      });
    });

    elements.rows.indexed.appendChild(row);
  });
}

function renderEmptyRow(target, colSpan, message) {
  const row = document.createElement("tr");
  row.innerHTML = `<td class="empty" colspan="${colSpan}">${escapeHtml(message)}</td>`;
  target.appendChild(row);
}

function filterEntries(entries, query) {
  if (!query) return entries;
  return entries.filter((entry) => {
    return `${entry.key} ${entry.value}`.toLowerCase().includes(query);
  });
}

function filterIndexedEntries(entries, query) {
  if (!query) return entries;
  return entries.filter((entry) => {
    return `${entry.database} ${entry.store} ${stringifyValue(entry.key)} ${stringifyValue(entry.value)}`
      .toLowerCase()
      .includes(query);
  });
}

async function seedDemoData() {
  localStorage.setItem("cradle:theme", "dark");
  localStorage.setItem("cradle:user", JSON.stringify({ name: "Demo User", role: "tester" }, null, 2));
  sessionStorage.setItem("cradle:active-tab", "storage-inspector");
  sessionStorage.setItem("cradle:draft", "Remember to export the storage snapshot.");
  document.cookie = "cradle_demo_cookie=visible_cookie_value; path=/; max-age=86400; SameSite=Lax";

  await seedIndexedDB();
  await refreshAll();
  setStatus("Demo data added to all storage types.");
}

function seedIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cradle-storage-inspector-demo", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles");
      }
      if (!db.objectStoreNames.contains("events")) {
        db.createObjectStore("events", { autoIncrement: true });
      }
    };

    request.onerror = () => reject(request.error || new Error("Could not seed IndexedDB."));
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["profiles", "events"], "readwrite");

      transaction.objectStore("profiles").put({ name: "Ada", role: "admin" }, "user-1");
      transaction.objectStore("profiles").put({ name: "Linus", role: "developer" }, "user-2");
      transaction.objectStore("events").add({ type: "login", createdAt: new Date().toISOString() });

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error || new Error("Could not write demo records."));
      };
    };
  });
}

function exportAllData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    origin: location.origin,
    localStorage: storageState.local,
    sessionStorage: storageState.session,
    cookies: storageState.cookies,
    indexedDB: storageState.indexed,
  };

  downloadJson("browser-storage-export.json", payload);
  setStatus("Storage snapshot exported.");
}

function downloadJson(filename, data) {
  const safeFilename = filename.replace(/[^\w.-]+/g, "-");
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = safeFilename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function showPanel(panelId) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.panel === panelId);
  });
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === panelId);
  });
}

function sortByKey(a, b) {
  return String(a.key).localeCompare(String(b.key));
}

function stringifyValue(value) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function labelFor(type) {
  const labels = {
    local: "LocalStorage",
    session: "SessionStorage",
    cookies: "Cookies",
    indexed: "IndexedDB",
  };
  return labels[type] || type;
}

function setStatus(message) {
  elements.statusMessage.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    elements.statusMessage.textContent = "";
  }, 3500);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
